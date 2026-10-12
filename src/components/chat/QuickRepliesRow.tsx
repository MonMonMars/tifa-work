import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useUi } from '../../theme/useUi';

interface Props {
  replies: readonly string[];
  busy: boolean;
  onPick: (text: string) => void;
}

export function QuickRepliesRow({ replies, busy, onPick }: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);

  if (replies.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="list"
      accessibilityLabel="Quick reply suggestions"
    >
      {replies.map((line) => (
        <Pressable
          key={line}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, busy && styles.chipDisabled]}
          onPress={() => onPick(line)}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Quick reply: ${line}`}
        >
          <Text style={styles.chipText} numberOfLines={2}>
            {line}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
    row: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
      gap: 8,
      flexDirection: 'row',
    },
    chip: {
      maxWidth: 200,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: UI.hairline,
      backgroundColor: UI.surfaceTop,
    },
    chipPressed: { opacity: 0.88 },
    chipDisabled: { opacity: 0.45 },
    chipText: { color: UI.textMid, fontSize: 13, fontWeight: '600', lineHeight: 17 },
  });
}
