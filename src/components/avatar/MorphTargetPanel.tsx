import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { weightsToMorphTargets } from '../../expression/emotionAdapter';
import { stageMotionFromWeights } from '../../expression/stageMotion';
import type { ExpressionSnapshot } from '../../expression/types';
import { UI } from '../../theme/tokens';

interface Props {
  expression: ExpressionSnapshot;
  accentColor: string;
}

export function MorphTargetPanel({ expression, accentColor }: Props) {
  const morphs = weightsToMorphTargets(expression.weights);
  const dominant = stageMotionFromWeights(expression.weights).dominant;

  return (
    <View style={styles.panel}>
      <Text style={styles.exprLabel}>
        {expression.label} · dominant: {dominant}
      </Text>
      {Object.entries(morphs).map(([key, value]) => (
        <View key={key} style={styles.barRow}>
          <Text style={styles.barKey}>{key}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.round(value * 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: UI.hairline,
    backgroundColor: UI.surface,
  },
  exprLabel: { color: UI.textMid, fontSize: 12, marginBottom: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barKey: { width: 72, color: UI.textDim, fontSize: 10 },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: UI.surfaceTop,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
});
