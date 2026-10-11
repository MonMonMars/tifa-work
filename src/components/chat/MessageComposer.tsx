import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { UI, inputFontSize } from '../../theme/tokens';

interface Props {
  busy: boolean;
  onSend: (text: string) => void;
}

export function MessageComposer({ busy, onSend }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setText('');
    onSend(trimmed);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={8}
    >
      <View style={styles.bar}>
        <TextInput
          style={styles.input}
          placeholder="Say something…"
          placeholderTextColor={UI.textDim}
          value={text}
          onChangeText={setText}
          editable={!busy}
          multiline
          maxLength={2000}
          onSubmitEditing={submit}
          blurOnSubmit={false}
        />
        <Pressable
          style={({ pressed }) => [styles.send, (busy || !text.trim()) && styles.sendDisabled, pressed && styles.sendPressed]}
          onPress={submit}
          disabled={busy || !text.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: UI.hairline,
    backgroundColor: UI.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: UI.surfaceTop,
    borderRadius: 3,
    color: UI.text,
    fontSize: inputFontSize(15),
  },
  send: {
    backgroundColor: UI.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 3,
  },
  sendDisabled: { opacity: 0.45 },
  sendPressed: { opacity: 0.9 },
  sendText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
