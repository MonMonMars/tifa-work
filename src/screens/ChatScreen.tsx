import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageComposer } from '../components/chat/MessageComposer';
import { MessageList } from '../components/chat/MessageList';
import { getPersona } from '../domain/personas';
import type { PersonaId } from '../domain/personas';
import { useCompanionStore } from '../store/companionStore';
import { UI } from '../theme/tokens';

interface Props {
  personaId: PersonaId;
  onClose: () => void;
}

export function ChatScreen({ personaId, onClose }: Props) {
  const { getHistory, ensureGreeting, sendMessage, chatBusy, llmConfig } = useCompanionStore();
  const persona = useMemo(() => getPersona(personaId), [personaId]);
  const messages = getHistory(personaId);

  useEffect(() => {
    ensureGreeting(personaId);
  }, [ensureGreeting, personaId]);

  const modeLabel = llmConfig.enabled && llmConfig.apiKey ? 'LLM stub (keys saved)' : 'Offline banter';

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.back}>← Home</Text>
        </Pressable>
        <View style={styles.headerMid}>
          <Text style={styles.title}>{persona.name}</Text>
          <Text style={styles.mode}>{modeLabel}</Text>
        </View>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.list}>
        <MessageList messages={messages} personaColor={persona.colors.primary} typing={chatBusy} />
      </View>

      <MessageComposer busy={chatBusy} onSend={(text) => void sendMessage(text)} />
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
  list: { flex: 1 },
});
