import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../../domain/messages';
import { UI } from '../../theme/tokens';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  personaColor: string;
  typing?: boolean;
}

export function MessageList({ messages, personaColor, typing }: Props) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, typing]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <MessageBubble message={item} personaColor={personaColor} />}
      ListFooterComponent={
        typing ? (
          <View style={styles.typing}>
            <Text style={styles.typingText}>Companion is typing…</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 12, flexGrow: 1 },
  typing: { paddingHorizontal: 16, paddingVertical: 8 },
  typingText: { color: UI.textDim, fontSize: 13, fontStyle: 'italic' },
});
