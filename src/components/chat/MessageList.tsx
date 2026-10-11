import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../../domain/messages';
import { UI } from '../../theme/tokens';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  personaColor: string;
  typing?: boolean;
  personaName?: string;
}

export function MessageList({ messages, personaColor, typing, personaName }: Props) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const scrollKey =
    messages.length > 0
      ? `${messages[messages.length - 1]?.id}:${messages[messages.length - 1]?.content.length}`
      : 'empty';

  useEffect(() => {
    if (messages.length === 0) return;
    listRef.current?.scrollToEnd({ animated: true });
  }, [scrollKey, typing, messages.length]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      accessibilityLabel="Chat messages"
      contentContainerStyle={[styles.content, messages.length === 0 && styles.contentEmpty]}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Start talking</Text>
          <Text style={styles.emptySub}>
            {personaName ? `${personaName} is here.` : 'Your companion is here.'} Offline banter works
            with no API key.
          </Text>
        </View>
      }
      renderItem={({ item }) => <MessageBubble message={item} personaColor={personaColor} />}
      ListFooterComponent={
        typing ? (
          <View style={styles.typing}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
            <Text style={styles.typingText}>Thinking…</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12, flexGrow: 1 },
  contentEmpty: { flex: 1, justifyContent: 'center' },
  empty: { paddingHorizontal: 24, alignItems: 'center' },
  emptyTitle: { color: UI.text, fontWeight: '800', fontSize: 18, marginBottom: 8 },
  emptySub: { color: UI.textDim, textAlign: 'center', lineHeight: 20, fontSize: 14 },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UI.accent,
    opacity: 0.35,
  },
  dot1: { opacity: 0.9 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.4 },
  typingText: { color: UI.textDim, fontSize: 13 },
});
