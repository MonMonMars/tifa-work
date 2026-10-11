import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../../domain/messages';
import { UI } from '../../theme/tokens';

interface Props {
  message: ChatMessage;
  personaColor: string;
}

export function MessageBubble({ message, personaColor }: Props) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          !isUser && { borderLeftColor: personaColor },
        ]}
      >
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 10, paddingHorizontal: 16 },
  rowUser: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '88%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 3,
  },
  bubbleUser: {
    backgroundColor: UI.surfaceTop,
  },
  bubbleAssistant: {
    backgroundColor: UI.surface,
    borderLeftWidth: 3,
  },
  text: { color: UI.text, fontSize: 15, lineHeight: 21 },
});
