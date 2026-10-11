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
import { isLlmConfigured } from '../services/ai/openAiCompatible';
import type { LlmConfig } from '../services/ai/types';
import { sendCompanionMessage } from '../services/chat/chatService';
import {
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
  memoryNotes: string[];
  expression: ExpressionSnapshot;
  chatBusy: boolean;
  chatError: string | null;
  lastChatProvider: ChatBrainMode | null;
  selectPersona: (id: PersonaId) => void;
  setLlmConfig: (patch: Partial<LlmConfig>) => void;
  rememberNote: (note: string) => void;
  getHistory: (id: PersonaId) => ChatMessage[];
  ensureGreeting: (id: PersonaId) => void;
  sendMessage: (text: string) => Promise<void>;
  setExpressionManual: (snapshot: ExpressionSnapshot) => void;
  clearChatError: () => void;
}

const CompanionContext = createContext<CompanionStoreValue | null>(null);

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

  const selectPersona = useCallback((id: PersonaId) => {
    setState((s) => ({ ...s, personaId: id, hasCompletedOnboarding: true }));
    setExpression({ ...IDLE_EXPRESSION, updatedAt: Date.now() });
  }, []);

  const setLlmConfig = useCallback((patch: Partial<LlmConfig>) => {
    setState((s) => ({ ...s, llmConfig: { ...s.llmConfig, ...patch } }));
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
    },
    [state.histories],
  );

  const clearChatError = useCallback(() => setChatError(null), []);

  const sendMessage = useCallback(
    async (text: string) => {
      const personaId = state.personaId;
      if (!personaId) return;
      const trimmed = text.trim();
      if (!trimmed || chatBusy) return;

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

      setState((s) => ({
        ...s,
        histories: {
          ...s.histories,
          [personaId]: [...history, userMessage],
        },
      }));

      try {
        const out = await sendCompanionMessage({
          personaId,
          userText: trimmed,
          history,
          llmConfig: state.llmConfig,
          memorySnippet,
        });

        setState((s) => {
          const current = s.histories[personaId] ?? [];
          const withoutDupUser =
            current.length > 0 && current[current.length - 1]?.id === userMessage.id
              ? current
              : [...current, userMessage];
          return {
            ...s,
            histories: {
              ...s.histories,
              [personaId]: [...withoutDupUser, out.assistantMessage],
            },
          };
        });
        setExpression(out.expression);
        setLastChatProvider(out.provider);
        if (out.llmError && isLlmConfigured(state.llmConfig)) {
          setChatError(out.llmError);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Send failed';
        setChatError(message);
      } finally {
        setChatBusy(false);
      }
    },
    [chatBusy, rememberNote, state.histories, state.llmConfig, state.memoryNotes, state.personaId],
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
      memoryNotes: state.memoryNotes,
      expression,
      chatBusy,
      chatError,
      lastChatProvider,
      selectPersona,
      setLlmConfig,
      rememberNote,
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
      clearChatError,
    }),
    [
      ready,
      state,
      expression,
      chatBusy,
      chatError,
      lastChatProvider,
      selectPersona,
      setLlmConfig,
      rememberNote,
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
      clearChatError,
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
