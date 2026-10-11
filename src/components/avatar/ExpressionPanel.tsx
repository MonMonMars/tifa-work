import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExpressionSnapshot } from '../../expression/types';
import { UI } from '../../theme/tokens';

interface Props {
  expression: ExpressionSnapshot;
  onProbeEmotion: (label: string, weights: ExpressionSnapshot['weights']) => void;
}

const PROBES: Array<{ label: string; weights: ExpressionSnapshot['weights'] }> = [
  { label: 'Smile', weights: { joy: 0.8, affection: 0.3 } },
  { label: 'Think', weights: { thinking: 0.7, neutral: 0.2 } },
  { label: 'Concern', weights: { sadness: 0.45, affection: 0.35 } },
];

export function ExpressionPanel({ expression, onProbeEmotion }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Expression (stub)</Text>
      <Text style={styles.sub}>{expression.source} · {expression.label}</Text>
      <View style={styles.row}>
        {PROBES.map((p) => (
          <Pressable
            key={p.label}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            onPress={() =>
              onProbeEmotion(p.label, p.weights)
            }
          >
            <Text style={styles.chipText}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    backgroundColor: UI.surfaceHi,
    borderTopWidth: 1,
    borderTopColor: UI.hairline,
  },
  title: { color: UI.text, fontWeight: '700', fontSize: 13 },
  sub: { color: UI.textDim, fontSize: 11, marginTop: 2, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: UI.accentLine,
    backgroundColor: UI.accentSoft,
  },
  chipPressed: { opacity: 0.85 },
  chipText: { color: UI.text, fontSize: 12, fontWeight: '600' },
});
