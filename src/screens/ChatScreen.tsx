import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageComposer } from '../components/chat/MessageComposer';
import { MessageList } from '../components/chat/MessageList';
import { getPersona } from '../domain/personas';
import type { PersonaId } from '../domain/personas';
import { isLlmConfigured } from '../services/ai/openAiCompatible';
import { useCompanionStore } from '../store/companionStore';
import { UI } from '../theme/tokens';

interface Props {
  personaId: PersonaId;
  onClose: () => void;
}

function brainLabel(
  llmConfig: ReturnType<typeof useCompanionStore>['llmConfig'],
  lastProvider: ReturnType<typeof useCompanionStore>['lastChatProvider'],
  busy: boolean,
): string {
  if (busy) return isLlmConfigured(llmConfig) ? 'Calling your LLM…' : 'Offline reply…';
  if (lastProvider === 'llm') return 'Connected · BYO LLM';
  if (isLlmConfigured(llmConfig)) return 'LLM ready · last reply offline';
  return 'Offline banter';
}

export function ChatScreen({ personaId, onClose }: Props) {
  const {
    getHistory,
    ensureGreeting,
    sendMessage,
    chatBusy,
    llmConfig,
    chatError,
    clearChatError,
    lastChatProvider,
  } = useCompanionStore();
  const persona = useMemo(() => getPersona(personaId), [personaId]);
  const messages = getHistory(personaId);

  useEffect(() => {
    ensureGreeting(personaId);
  }, [ensureGreeting, personaId]);

  useEffect(() => {
    if (!chatError) return;
    const t = setTimeout(clearChatError, 6000);
    return () => clearTimeout(t);
  }, [chatError, clearChatError]);

  const modeLabel = brainLabel(llmConfig, lastChatProvider, chatBusy);

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.back}>← Home</Text>
        </Pressable>
        <View style={styles.headerMid}>
          <Text style={styles.title}>
            {persona.emoji} {persona.name}
          </Text>
          <Text style={styles.mode}>{modeLabel}</Text>
        </View>
        <View style={{ width: 64 }} />
      </View>

      {chatError ? (
        <Pressable style={styles.banner} onPress={clearChatError}>
          <Text style={styles.bannerText}>LLM issue: {chatError}</Text>
        </Pressable>
      ) : null}

      <View style={styles.list}>
        <MessageList
          messages={messages}
          personaColor={persona.colors.primary}
          typing={chatBusy}
          personaName={persona.name}
        />
      </View>

      <MessageComposer
        busy={chatBusy}
        busyLabel={isLlmConfigured(llmConfig) ? 'Sending…' : 'Replying…'}
        onSend={(text) => void sendMessage(text)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: UI.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: UI.hairline,
  },
  back: { color: UI.accent, fontWeight: '700', width: 64 },
  headerMid: { flex: 1, alignItems: 'center' },
  title: { color: UI.text, fontWeight: '800', fontSize: 17 },
  mode: { color: UI.textDim, fontSize: 11, marginTop: 2 },
  banner: {
    backgroundColor: UI.accentSoft,
    borderBottomWidth: 1,
    borderBottomColor: UI.accentLine,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bannerText: { color: UI.textMid, fontSize: 12 },
  list: { flex: 1 },
});
