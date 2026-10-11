import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../../domain/messages';
import { UI } from '../../theme/tokens';

interface Props {
  message: ChatMessage;
  personaColor: string;
  showMeta?: boolean;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function MessageBubble({ message, personaColor, showMeta = true }: Props) {
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
        {showMeta && (
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{formatTime(message.ts)}</Text>
            {!isUser && message.emotionTag ? (
              <Text style={[styles.emotion, { color: personaColor }]}>{message.emotionTag}</Text>
            ) : null}
          </View>
        )}
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  meta: { color: UI.textDim, fontSize: 10 },
  emotion: { fontSize: 10, fontWeight: '700', textTransform: 'lowercase' },
});
