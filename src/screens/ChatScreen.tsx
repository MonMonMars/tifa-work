import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageComposer } from '../components/chat/MessageComposer';
import { MessageList } from '../components/chat/MessageList';
import { getPersona } from '../domain/personas';
import type { PersonaId } from '../domain/personas';
import { isLlmConfigured } from '../services/ai/llmRouting';
import { useCompanionStore } from '../store/companionStore';
import { inputFontSize } from '../theme/tokens';
import { useUi } from '../theme/useUi';

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
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);

  const {
    getHistory,
    ensureGreeting,
    sendMessage,
    chatBusy,
    llmConfig,
    chatError,
    clearChatError,
    lastChatProvider,
    isSpeaking,
    clearThread,
  } = useCompanionStore();
  const [search, setSearch] = useState('');
  const persona = useMemo(() => getPersona(personaId), [personaId]);
  const messages = getHistory(personaId);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, search]);

  useEffect(() => {
    ensureGreeting(personaId);
  }, [ensureGreeting, personaId]);

  useEffect(() => {
    if (!chatError) return;
    const t = setTimeout(clearChatError, 6000);
    return () => clearTimeout(t);
  }, [chatError, clearChatError]);

  const modeLabel = [
    brainLabel(llmConfig, lastChatProvider, chatBusy),
    isSpeaking ? 'Speaking…' : null,
    llmConfig.streamEnabled && isLlmConfigured(llmConfig) ? 'stream on' : null,
    search.trim() ? `search ${filtered.length}/${messages.length}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const onClearThread = () => {
    Alert.alert(
      'Clear this chat?',
      `Removes all messages with ${persona.name} on this device. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear chat',
          style: 'destructive',
          onPress: () => {
            clearThread(personaId);
            setSearch('');
            ensureGreeting(personaId);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Text style={styles.back}>← Home</Text>
        </Pressable>
        <View style={styles.headerMid}>
          <Text style={styles.title}>
            {persona.emoji} {persona.name}
          </Text>
          <Text style={styles.mode}>{modeLabel}</Text>
        </View>
        <Pressable
          onPress={onClearThread}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear chat thread"
        >
          <Text style={styles.clearBtn}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages…"
          placeholderTextColor={UI.textDim}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          accessibilityLabel="Search chat messages"
        />
      </View>

      {chatError ? (
        <Pressable
          style={styles.banner}
          onPress={clearChatError}
          accessibilityRole="button"
          accessibilityLabel={`LLM issue: ${chatError}. Tap to dismiss.`}
        >
          <Text style={styles.bannerText}>LLM issue: {chatError}</Text>
        </Pressable>
      ) : null}

      <View style={styles.list}>
        <MessageList
          messages={filtered}
          personaColor={persona.colors.primary}
          typing={chatBusy && !search.trim()}
          personaName={persona.name}
          emptySearch={Boolean(search.trim()) && filtered.length === 0}
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

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
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
    clearBtn: { color: UI.textDim, fontWeight: '700', fontSize: 13, width: 64, textAlign: 'right' },
    headerMid: { flex: 1, alignItems: 'center' },
    title: { color: UI.text, fontWeight: '800', fontSize: 17 },
    mode: { color: UI.textDim, fontSize: 11, marginTop: 2 },
    searchRow: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: UI.hairline },
    searchInput: {
      backgroundColor: UI.surfaceTop,
      borderRadius: 3,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: UI.text,
      fontSize: inputFontSize(14),
      borderWidth: 1,
      borderColor: UI.hairline,
    },
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
}
