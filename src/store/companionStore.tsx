import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { trimThreadForStorage } from '../domain/chatThreadLimits';
import type { ChatMessage } from '../domain/messages';
import { createMessage } from '../domain/messages';
import type { MemoryNote } from '../domain/memoryNote';
import { memoryTextsForPrompt } from '../domain/memoryNote';
import type { PersonaId } from '../domain/personas';
import { getPersona } from '../domain/personas';
import { IDLE_EXPRESSION, type ExpressionSnapshot } from '../expression/types';
import { analyzeUserText } from '../expression/emotionAdapter';
import { extractMemoryNote } from '../services/ai/memoryExtract';
import { isLlmConfigured } from '../services/ai/llmRouting';
import { buildAvatarPokeLine } from '../services/ai/offlineBanterPacks';
import { openAiCompatibleProvider } from '../services/ai/llmProviderStub';
import type { LlmConfig } from '../services/ai/types';
import {
  applyCheckIn,
  localDateKey,
  type CheckInState,
} from '../services/checkIn/streak';
import {
  applyReplyToAssistant,
  createStreamingAssistantShell,
  sendCompanionMessage,
} from '../services/chat/chatService';
import { deviceTts } from '../services/voice/tts';
import { buildFocusLast7Days } from '../services/focus/focusHistory';
import { buildFocusCompanionLine } from '../services/focus/focusBanter';
import {
  dismissSoftBreak,
  endFocusSession,
  formatWorkFocusMemoryNote,
  isEarlyFocusAbandon,
  reconcileFocusOnLoad,
  startFocusSession,
  startSoftBreak,
} from '../services/focus/focusSession';
import type { FocusPreset } from '../services/focus/types';
import { hapticOnCheckIn, hapticOnSend } from '../services/haptics/feedback';
import { syncCheckInReminderSchedule } from '../services/notifications/checkInReminders';
import type { NotificationPrefs } from '../services/notifications/types';
import type { WorkCompanionPrefs } from '../services/focus/types';
import type { VoiceConfig } from '../services/voice/types';
import type { ThemeMode } from '../theme/palettes';
import {
  clearPersistedState,
  DEFAULT_PERSISTED,
  loadPersistedState,
  savePersistedState,
  type PersistedState,
} from './persistence';

export type ChatBrainMode = 'offline' | 'llm';

interface CompanionStoreValue {
  ready: boolean;
  personaId: PersonaId | null;
  histories: Partial<Record<PersonaId, ChatMessage[]>>;
  llmConfig: LlmConfig;
  voiceConfig: VoiceConfig;
  memoryNotes: MemoryNote[];
  togglePinMemoryNote: (text: string) => void;
  bootRecoveryBanner: string | null;
  dismissBootRecoveryBanner: () => void;
  expression: ExpressionSnapshot;
  chatBusy: boolean;
  chatError: string | null;
  lastChatProvider: ChatBrainMode | null;
  isSpeaking: boolean;
  checkIn: CheckInState;
  checkInToast: string | null;
  performCheckIn: () => void;
  clearCheckInToast: () => void;
  selectPersona: (id: PersonaId) => void;
  setLlmConfig: (patch: Partial<LlmConfig>) => void;
  setVoiceConfig: (patch: Partial<VoiceConfig>) => void;
  rememberNote: (note: string) => void;
  getHistory: (id: PersonaId) => ChatMessage[];
  ensureGreeting: (id: PersonaId) => void;
  sendMessage: (text: string) => Promise<void>;
  setExpressionManual: (snapshot: ExpressionSnapshot) => void;
  clearChatError: () => void;
  stopSpeaking: () => Promise<void>;
  wipeAllLocalData: () => Promise<void>;
  clearThread: (personaId: PersonaId) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (patch: Partial<NotificationPrefs>) => Promise<void>;
  hasSeenPreChatTips: boolean;
  markPreChatTipsSeen: () => void;
  avatarPokeToast: string | null;
  pokeAvatar: () => void;
  clearAvatarPokeToast: () => void;
  focusMinutesToday: number;
  focusActive: PersistedState['focus']['active'];
  focusToast: string | null;
  startFocusSession: (durationMinutes: number, preset: FocusPreset) => void;
  stopFocusSession: () => void;
  completeFocusSession: () => void;
  clearFocusToast: () => void;
  saveFocusWorkNote: (note: string) => void;
  workCompanion: WorkCompanionPrefs;
  setWorkCompanionPrefs: (patch: Partial<WorkCompanionPrefs>) => void;
  focusLast7Days: ReturnType<typeof buildFocusLast7Days>;
  focusActiveBreak: PersistedState['focus']['activeBreak'];
  dismissFocusBreak: () => void;
}

const CompanionContext = createContext<CompanionStoreValue | null>(null);

function patchMessageContent(
  histories: Partial<Record<PersonaId, ChatMessage[]>>,
  personaId: PersonaId,
  messageId: string,
  content: string,
): Partial<Record<PersonaId, ChatMessage[]>> {
  const list = histories[personaId] ?? [];
  return {
    ...histories,
    [personaId]: trimThreadForStorage(
      list.map((m) => (m.id === messageId ? { ...m, content } : m)),
    ),
  };
}

function withThread(
  histories: Partial<Record<PersonaId, ChatMessage[]>>,
  personaId: PersonaId,
  list: ChatMessage[],
): Partial<Record<PersonaId, ChatMessage[]>> {
  return { ...histories, [personaId]: trimThreadForStorage(list) };
}

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState>(DEFAULT_PERSISTED);
  const [expression, setExpression] = useState<ExpressionSnapshot>({
    ...IDLE_EXPRESSION,
    updatedAt: Date.now(),
  });
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastChatProvider, setLastChatProvider] = useState<ChatBrainMode | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [checkInToast, setCheckInToast] = useState<string | null>(null);
  const [avatarPokeToast, setAvatarPokeToast] = useState<string | null>(null);
  const [focusToast, setFocusToast] = useState<string | null>(null);
  const [bootRecoveryBanner, setBootRecoveryBanner] = useState<string | null>(null);

  const showFocusLine = useCallback(
    (phase: 'start' | 'complete' | 'abandon', seed: number) => {
      const personaId = state.personaId;
      if (!personaId) return;
      const line = buildFocusCompanionLine(
        personaId,
        state.voiceConfig.banterPack,
        phase,
        seed,
        state.workCompanion.tipsEnabled,
      );
      if (line) setFocusToast(line);
    },
    [state.personaId, state.voiceConfig.banterPack, state.workCompanion.tipsEnabled],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const { state: loaded, recoveredFromStorageIssue } = await loadPersistedState();
      if (!alive) return;
      const now = Date.now();
      const reconciled = reconcileFocusOnLoad(loaded.focus, now);
      let next = loaded;
      if (reconciled) {
        next = { ...loaded, focus: reconciled.focus };
        if (reconciled.minutesLogged > 0 && loaded.personaId) {
          const line = buildFocusCompanionLine(
            loaded.personaId,
            loaded.voiceConfig.banterPack,
            'complete',
            now,
            loaded.workCompanion.tipsEnabled,
          );
          if (line) setFocusToast(line);
        }
      }
      setState(next);
      if (recoveredFromStorageIssue) {
        setBootRecoveryBanner(
          'We could not read saved data on this device — started fresh. Your prior chats may be gone on this phone only.',
        );
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void savePersistedState(state);
  }, [state, ready]);

  useEffect(
    () => () => {
      void deviceTts.stop();
    },
    [],
  );

  const selectPersona = useCallback((id: PersonaId) => {
    setState((s) => ({ ...s, personaId: id, hasCompletedOnboarding: true }));
    setExpression({ ...IDLE_EXPRESSION, updatedAt: Date.now() });
  }, []);

  const setLlmConfig = useCallback((patch: Partial<LlmConfig>) => {
    setState((s) => ({ ...s, llmConfig: { ...s.llmConfig, ...patch } }));
  }, []);

  const setVoiceConfig = useCallback((patch: Partial<VoiceConfig>) => {
    setState((s) => ({ ...s, voiceConfig: { ...s.voiceConfig, ...patch } }));
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    setState((s) => ({ ...s, themeMode }));
  }, []);

  const setNotificationPrefs = useCallback(async (patch: Partial<NotificationPrefs>) => {
    let nextEnabled = false;
    setState((s) => {
      const notificationPrefs = { ...s.notificationPrefs, ...patch };
      nextEnabled = notificationPrefs.checkInRemindersEnabled;
      return { ...s, notificationPrefs };
    });
    await syncCheckInReminderSchedule(nextEnabled);
  }, []);

  const markPreChatTipsSeen = useCallback(() => {
    setState((s) => ({ ...s, hasSeenPreChatTips: true }));
  }, []);

  const clearAvatarPokeToast = useCallback(() => setAvatarPokeToast(null), []);

  const setWorkCompanionPrefs = useCallback((patch: Partial<WorkCompanionPrefs>) => {
    setState((s) => ({ ...s, workCompanion: { ...s.workCompanion, ...patch } }));
  }, []);

  const clearFocusToast = useCallback(() => setFocusToast(null), []);

  const startFocusSessionAction = useCallback(
    (durationMinutes: number, preset: FocusPreset) => {
      const now = Date.now();
      setState((s) => ({
        ...s,
        focus: startFocusSession(s.focus, now, durationMinutes, preset),
      }));
      showFocusLine('start', now);
      setExpression({
        weights: { thinking: 0.55, neutral: 0.35, joy: 0.15 },
        label: 'Focus · deep work',
        source: 'manual',
        updatedAt: now,
      });
      void hapticOnSend();
    },
    [showFocusLine],
  );

  const dismissFocusBreak = useCallback(() => {
    setState((s) => ({ ...s, focus: dismissSoftBreak(s.focus) }));
  }, []);

  const finishFocusSession = useCallback(
    (reason: 'complete' | 'stop') => {
      const now = Date.now();
      let abandoned = false;
      setState((s) => {
        const session = s.focus.active;
        if (session) {
          abandoned = isEarlyFocusAbandon(session, now, reason);
        }
        const result = endFocusSession(s.focus, now, reason);
        let focus = result.focus;
        if (reason === 'complete' && s.workCompanion.breakReminderEnabled) {
          focus = startSoftBreak(focus, now);
        }
        return { ...s, focus };
      });
      if (abandoned) {
        showFocusLine('abandon', now);
        setExpression({
          weights: { affection: 0.4, neutral: 0.35, sadness: 0.12 },
          label: 'Focus · gentle pause',
          source: 'manual',
          updatedAt: now,
        });
      } else {
        showFocusLine('complete', now);
        setExpression({
          weights: { joy: 0.5, affection: 0.25, neutral: 0.2 },
          label: 'Focus · done',
          source: 'manual',
          updatedAt: now,
        });
      }
    },
    [showFocusLine],
  );

  const stopFocusSession = useCallback(() => finishFocusSession('stop'), [finishFocusSession]);
  const completeFocusSession = useCallback(() => finishFocusSession('complete'), [finishFocusSession]);

  const pokeAvatar = useCallback(() => {
    const personaId = state.personaId;
    if (!personaId) return;
    void hapticOnSend();
    const line = buildAvatarPokeLine(personaId, state.voiceConfig.banterPack, Date.now());
    setAvatarPokeToast(line);
    setExpression({
      weights: { joy: 0.82, affection: 0.48, surprise: 0.22, neutral: 0.08 },
      label: 'Poke · joy pulse',
      source: 'manual',
      updatedAt: Date.now(),
    });
  }, [state.personaId, state.voiceConfig.banterPack]);

  const clearThread = useCallback((personaId: PersonaId) => {
    setState((s) => ({
      ...s,
      histories: { ...s.histories, [personaId]: [] },
    }));
    setExpression({ ...IDLE_EXPRESSION, updatedAt: Date.now() });
  }, []);

  const rememberNote = useCallback((note: string) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      memoryNotes: [...s.memoryNotes, { text: trimmed, pinned: false }].slice(-12),
    }));
  }, []);

  const togglePinMemoryNote = useCallback((text: string) => {
    setState((s) => ({
      ...s,
      memoryNotes: s.memoryNotes.map((n) =>
        n.text === text ? { ...n, pinned: !n.pinned } : n,
      ),
    }));
  }, []);

  const dismissBootRecoveryBanner = useCallback(() => setBootRecoveryBanner(null), []);

  const saveFocusWorkNote = useCallback(
    (note: string) => {
      const formatted = formatWorkFocusMemoryNote(note);
      if (formatted) rememberNote(formatted);
    },
    [rememberNote],
  );

  const getHistory = useCallback(
    (id: PersonaId) => state.histories[id] ?? [],
    [state.histories],
  );

  const clearChatError = useCallback(() => setChatError(null), []);

  const stopSpeaking = useCallback(async () => {
    setIsSpeaking(false);
    await deviceTts.stop();
  }, []);

  const maybeSpeak = useCallback(
    async (text: string, emotionTag?: string, voiceConfig?: VoiceConfig) => {
      const cfg = voiceConfig ?? state.voiceConfig;
      if (!cfg.ttsEnabled) return;
      setIsSpeaking(true);
      try {
        await deviceTts.speak(text, {
          locale: cfg.locale,
          rate: cfg.rate,
          emotionTag,
        });
      } finally {
        setIsSpeaking(false);
      }
    },
    [state.voiceConfig],
  );

  const ensureGreeting = useCallback(
    (id: PersonaId) => {
      const existing = state.histories[id] ?? [];
      if (existing.length > 0) return;
      const persona = getPersona(id);
      const greet = createMessage('assistant', persona.greet);
      setState((s) => ({
        ...s,
        histories: withThread(s.histories, id, [greet]),
      }));
      void maybeSpeak(persona.greet, undefined, state.voiceConfig);
    },
    [maybeSpeak, state.histories, state.voiceConfig],
  );

  const performCheckIn = useCallback(() => {
    const today = localDateKey();
    const result = applyCheckIn(state.checkIn, today);
    setState((s) => ({ ...s, checkIn: result.state }));
    setCheckInToast(result.message);
    if (!result.alreadyCheckedIn) {
      void hapticOnCheckIn(true);
      setExpression({
        weights: { joy: 0.55, affection: 0.35, neutral: 0.15 },
        label: 'Check-in · proud',
        source: 'manual',
        updatedAt: Date.now(),
      });
    }
  }, [state.checkIn]);

  const clearCheckInToast = useCallback(() => setCheckInToast(null), []);

  const wipeAllLocalData = useCallback(async () => {
    await stopSpeaking();
    await syncCheckInReminderSchedule(false);
    await clearPersistedState();
    setState({ ...DEFAULT_PERSISTED });
    setExpression({ ...IDLE_EXPRESSION, updatedAt: Date.now() });
    setChatError(null);
    setLastChatProvider(null);
    setChatBusy(false);
    setIsSpeaking(false);
    setCheckInToast(null);
    setAvatarPokeToast(null);
    setBootRecoveryBanner(null);
  }, [stopSpeaking]);

  const sendMessage = useCallback(
    async (text: string) => {
      const personaId = state.personaId;
      if (!personaId) return;
      const trimmed = text.trim();
      if (!trimmed || chatBusy) return;

      await stopSpeaking();
      if (state.voiceConfig.hapticsOnSend) void hapticOnSend();
      setChatBusy(true);
      setChatError(null);
      setExpression(analyzeUserText(trimmed));

      const memoryFromText = extractMemoryNote(trimmed);
      if (memoryFromText) {
        rememberNote(memoryFromText);
      }

      const history = state.histories[personaId] ?? [];
      const promptTexts = memoryTextsForPrompt(state.memoryNotes, 5);
      const memorySnippet = (
        memoryFromText ? [...promptTexts, memoryFromText] : promptTexts
      )
        .slice(-5)
        .join('; ');
      const userMessage = createMessage('user', trimmed);

      const useStream =
        isLlmConfigured(state.llmConfig) && state.llmConfig.streamEnabled;

      let assistantShell: ChatMessage | null = null;
      let streamShellId: string | null = null;
      if (useStream) {
        assistantShell = createStreamingAssistantShell();
        streamShellId = assistantShell.id;
        setState((s) => ({
          ...s,
          histories: withThread(s.histories, personaId, [
            ...history,
            userMessage,
            assistantShell!,
          ]),
        }));
      } else {
        setState((s) => ({
          ...s,
          histories: withThread(s.histories, personaId, [...history, userMessage]),
        }));
      }

      try {
        if (useStream && assistantShell) {
          const shellId = assistantShell.id;
          const result = await openAiCompatibleProvider.complete(
            {
              personaId,
              messages: history,
              userText: trimmed,
              memorySnippet,
              banterPack: state.voiceConfig.banterPack,
            },
            state.llmConfig,
            {
              preferStream: true,
              onPartial: (accumulated) => {
                setState((s) => ({
                  ...s,
                  histories: patchMessageContent(s.histories, personaId, shellId, accumulated),
                }));
              },
            },
          );

          const { message, expression: expr } = applyReplyToAssistant(assistantShell, result.reply);
          setState((s) => {
            const list = s.histories[personaId] ?? [];
            return {
              ...s,
              histories: withThread(
                s.histories,
                personaId,
                list.map((m) => (m.id === shellId ? message : m)),
              ),
            };
          });
          setExpression(expr);
          setLastChatProvider(result.provider);
          if (result.llmError) setChatError(result.llmError);
          void maybeSpeak(message.content, message.emotionTag, state.voiceConfig);
        } else {
          const out = await sendCompanionMessage({
            personaId,
            userText: trimmed,
            history,
            llmConfig: state.llmConfig,
            memorySnippet,
            banterPack: state.voiceConfig.banterPack,
          });

          setState((s) => {
            const current = s.histories[personaId] ?? [];
            return {
              ...s,
              histories: withThread(s.histories, personaId, [
                ...current,
                out.assistantMessage,
              ]),
            };
          });
          setExpression(out.expression);
          setLastChatProvider(out.provider);
          if (out.llmError && isLlmConfigured(state.llmConfig)) {
            setChatError(out.llmError);
          }
          void maybeSpeak(out.assistantMessage.content, out.assistantMessage.emotionTag, state.voiceConfig);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Send failed';
        setChatError(message);
        if (streamShellId) {
          const fallback = createMessage(
            'assistant',
            "Something went wrong and I couldn't finish that reply. Try again?",
          );
          setState((s) => {
            const list = s.histories[personaId] ?? [];
            return {
              ...s,
              histories: withThread(
                s.histories,
                personaId,
                list.map((m) => (m.id === streamShellId ? fallback : m)),
              ),
            };
          });
        }
      } finally {
        setChatBusy(false);
      }
    },
    [
      chatBusy,
      maybeSpeak,
      rememberNote,
      state.histories,
      state.llmConfig,
      state.memoryNotes,
      state.personaId,
      state.voiceConfig,
      stopSpeaking,
    ],
  );

  const setExpressionManual = useCallback((snapshot: ExpressionSnapshot) => {
    setExpression(snapshot);
  }, []);

  const value = useMemo<CompanionStoreValue>(
    () => ({
      ready,
      personaId: state.personaId,
      histories: state.histories,
      llmConfig: state.llmConfig,
      voiceConfig: state.voiceConfig,
      memoryNotes: state.memoryNotes,
      expression,
      chatBusy,
      chatError,
      lastChatProvider,
      isSpeaking,
      checkIn: state.checkIn,
      checkInToast,
      performCheckIn,
      clearCheckInToast,
      selectPersona,
      setLlmConfig,
      setVoiceConfig,
      rememberNote,
      togglePinMemoryNote,
      bootRecoveryBanner,
      dismissBootRecoveryBanner,
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
      clearChatError,
      stopSpeaking,
      wipeAllLocalData,
      clearThread,
      themeMode: state.themeMode,
      setThemeMode,
      notificationPrefs: state.notificationPrefs,
      setNotificationPrefs,
      hasSeenPreChatTips: state.hasSeenPreChatTips,
      markPreChatTipsSeen,
      avatarPokeToast,
      pokeAvatar,
      clearAvatarPokeToast,
      focusMinutesToday:
        state.focus.daily.dayKey === localDateKey()
          ? state.focus.daily.minutesToday
          : 0,
      focusActive: state.focus.active,
      focusToast,
      startFocusSession: startFocusSessionAction,
      stopFocusSession,
      completeFocusSession,
      clearFocusToast,
      saveFocusWorkNote,
      workCompanion: state.workCompanion,
      setWorkCompanionPrefs,
      focusLast7Days: buildFocusLast7Days(state.focus.minutesByDay, localDateKey()),
      focusActiveBreak: state.focus.activeBreak,
      dismissFocusBreak,
    }),
    [
      ready,
      state,
      expression,
      chatBusy,
      chatError,
      lastChatProvider,
      isSpeaking,
      checkInToast,
      performCheckIn,
      clearCheckInToast,
      selectPersona,
      setLlmConfig,
      setVoiceConfig,
      rememberNote,
      togglePinMemoryNote,
      bootRecoveryBanner,
      dismissBootRecoveryBanner,
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
      clearChatError,
      stopSpeaking,
      wipeAllLocalData,
      clearThread,
      setThemeMode,
      setNotificationPrefs,
      markPreChatTipsSeen,
      avatarPokeToast,
      pokeAvatar,
      clearAvatarPokeToast,
      focusToast,
      startFocusSessionAction,
      stopFocusSession,
      completeFocusSession,
      clearFocusToast,
      saveFocusWorkNote,
      setWorkCompanionPrefs,
      dismissFocusBreak,
    ],
  );

  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>;
}

export function useCompanionStore(): CompanionStoreValue {
  const ctx = useContext(CompanionContext);
  if (!ctx) {
    throw new Error('useCompanionStore must be used within CompanionProvider');
  }
  return ctx;
}
