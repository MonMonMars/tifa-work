import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ChatMessage } from '../domain/messages';
import { createMessage } from '../domain/messages';
import type { PersonaId } from '../domain/personas';
import { getPersona } from '../domain/personas';
import { IDLE_EXPRESSION, type ExpressionSnapshot } from '../expression/types';
import { analyzeUserText } from '../expression/emotionAdapter';
import { extractMemoryNote } from '../services/ai/memoryExtract';
import { isLlmConfigured } from '../services/ai/llmRouting';
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
import type { VoiceConfig } from '../services/voice/types';
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
  memoryNotes: string[];
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
    [personaId]: list.map((m) => (m.id === messageId ? { ...m, content } : m)),
  };
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

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadPersistedState();
      if (!alive) return;
      setState(loaded);
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

  const rememberNote = useCallback((note: string) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      memoryNotes: [...s.memoryNotes, trimmed].slice(-12),
    }));
  }, []);

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
        histories: { ...s.histories, [id]: [greet] },
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
    await clearPersistedState();
    setState({ ...DEFAULT_PERSISTED });
    setExpression({ ...IDLE_EXPRESSION, updatedAt: Date.now() });
    setChatError(null);
    setLastChatProvider(null);
    setChatBusy(false);
    setIsSpeaking(false);
    setCheckInToast(null);
  }, [stopSpeaking]);

  const sendMessage = useCallback(
    async (text: string) => {
      const personaId = state.personaId;
      if (!personaId) return;
      const trimmed = text.trim();
      if (!trimmed || chatBusy) return;

      await stopSpeaking();
      setChatBusy(true);
      setChatError(null);
      setExpression(analyzeUserText(trimmed));

      const memoryFromText = extractMemoryNote(trimmed);
      if (memoryFromText) {
        rememberNote(memoryFromText);
      }

      const history = state.histories[personaId] ?? [];
      const memorySnippet = [...state.memoryNotes, memoryFromText].filter(Boolean).slice(-5).join('; ');
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
          histories: {
            ...s.histories,
            [personaId]: [...history, userMessage, assistantShell!],
          },
        }));
      } else {
        setState((s) => ({
          ...s,
          histories: {
            ...s.histories,
            [personaId]: [...history, userMessage],
          },
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
              histories: {
                ...s.histories,
                [personaId]: list.map((m) => (m.id === shellId ? message : m)),
              },
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
              histories: {
                ...s.histories,
                [personaId]: [...current, out.assistantMessage],
              },
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
              histories: {
                ...s.histories,
                [personaId]: list.map((m) => (m.id === streamShellId ? fallback : m)),
              },
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
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
      clearChatError,
      stopSpeaking,
      wipeAllLocalData,
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
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
      clearChatError,
      stopSpeaking,
      wipeAllLocalData,
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
