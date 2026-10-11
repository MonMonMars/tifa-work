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
import type { LlmConfig } from '../services/ai/types';
import { sendCompanionMessage } from '../services/chat/chatService';
import {
  DEFAULT_PERSISTED,
  loadPersistedState,
  savePersistedState,
  type PersistedState,
} from './persistence';

interface CompanionStoreValue {
  ready: boolean;
  personaId: PersonaId | null;
  histories: Partial<Record<PersonaId, ChatMessage[]>>;
  llmConfig: LlmConfig;
  memoryNotes: string[];
  expression: ExpressionSnapshot;
  chatBusy: boolean;
  selectPersona: (id: PersonaId) => void;
  setLlmConfig: (patch: Partial<LlmConfig>) => void;
  rememberNote: (note: string) => void;
  getHistory: (id: PersonaId) => ChatMessage[];
  ensureGreeting: (id: PersonaId) => void;
  sendMessage: (text: string) => Promise<void>;
  setExpressionManual: (snapshot: ExpressionSnapshot) => void;
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
      memoryNotes: [...s.memoryNotes, trimmed].slice(-20),
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

  const sendMessage = useCallback(
    async (text: string) => {
      const personaId = state.personaId;
      if (!personaId) return;
      const trimmed = text.trim();
      if (!trimmed || chatBusy) return;

      setChatBusy(true);
      setExpression(analyzeUserText(trimmed));

      const history = state.histories[personaId] ?? [];
      const memorySnippet = state.memoryNotes.slice(-3).join('; ');

      try {
        const out = await sendCompanionMessage({
          personaId,
          userText: trimmed,
          history,
          llmConfig: state.llmConfig,
          memorySnippet,
        });

        setState((s) => ({
          ...s,
          histories: {
            ...s.histories,
            [personaId]: [...history, out.userMessage, out.assistantMessage],
          },
        }));
        setExpression(out.expression);
      } finally {
        setChatBusy(false);
      }
    },
    [chatBusy, state.histories, state.llmConfig, state.memoryNotes, state.personaId],
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
      selectPersona,
      setLlmConfig,
      rememberNote,
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
    }),
    [
      ready,
      state,
      expression,
      chatBusy,
      selectPersona,
      setLlmConfig,
      rememberNote,
      getHistory,
      ensureGreeting,
      sendMessage,
      setExpressionManual,
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
