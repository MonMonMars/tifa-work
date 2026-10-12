import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PersonaId } from '../../domain/personas';
import { getPersona } from '../../domain/personas';
import { weightsToMorphTargets } from '../../expression/emotionAdapter';
import type { ExpressionSnapshot } from '../../expression/types';
import { UI } from '../../theme/tokens';

interface Props {
  personaId: PersonaId;
  expression: ExpressionSnapshot;
}

/**
 * M2 placeholder until VRM + expo-gl lands (see docs/VRM_AVATAR.md).
 * Shows persona identity + live morph target bars driven by expression state.
 */
export function AvatarPlaceholder({ personaId, expression }: Props) {
  const persona = getPersona(personaId);
  const morphs = weightsToMorphTargets(expression.weights);

  return (
    <View style={styles.stage} accessibilityLabel="Companion avatar placeholder">
      <View style={[styles.glow, { backgroundColor: persona.colors.primary }]} />
      <View style={styles.figure}>
        <Text style={styles.emoji}>{persona.emoji}</Text>
        <Text style={styles.name}>{persona.name}</Text>
        <Text style={styles.hint}>VRM stage · coming in M2</Text>
      </View>
      <View style={styles.morphPanel}>
        <Text style={styles.exprLabel}>{expression.label}</Text>
        {Object.entries(morphs).map(([key, value]) => (
          <View key={key} style={styles.barRow}>
            <Text style={styles.barKey}>{key}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.round(value * 100)}%`,
                    backgroundColor: persona.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: UI.bgDeep,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  glow: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    width: 200,
    height: 200,
    opacity: 0.12,
    borderRadius: 100,
  },
  figure: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  emoji: { fontSize: 72, marginBottom: 8 },
  name: { color: UI.text, fontSize: 22, fontWeight: '800' },
  hint: { color: UI.textDim, fontSize: 12, marginTop: 4 },
  morphPanel: {
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
