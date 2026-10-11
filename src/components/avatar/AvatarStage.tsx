import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PersonaId } from '../../domain/personas';
import { getPersona } from '../../domain/personas';
import type { ExpressionSnapshot } from '../../expression/types';
import { UI } from '../../theme/tokens';
import { GlAvatarView } from './GlAvatarView';
import { MorphTargetPanel } from './MorphTargetPanel';

interface Props {
  personaId: PersonaId;
  expression: ExpressionSnapshot;
}

export function AvatarStage({ personaId, expression }: Props) {
  const persona = getPersona(personaId);
  const [glFailed, setGlFailed] = useState(false);

  return (
    <View style={styles.stage} accessibilityLabel="Companion avatar stage">
      <View style={[styles.glow, { backgroundColor: persona.colors.primary }]} />
      <View style={styles.viewport}>
        {glFailed ? (
          <View style={styles.fallback}>
            <Text style={styles.emoji}>{persona.emoji}</Text>
            <Text style={styles.name}>{persona.name}</Text>
            <Text style={styles.hint}>WebGL unavailable — using static preview</Text>
          </View>
        ) : (
          <GlAvatarView
            accentColor={persona.colors.primary}
            expression={expression}
            onFailed={() => setGlFailed(true)}
          />
        )}
      </View>
      <MorphTargetPanel expression={expression} accentColor={persona.colors.primary} />
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
    zIndex: 0,
  },
  viewport: { flex: 1, minHeight: 180 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64, marginBottom: 8 },
  name: { color: UI.text, fontSize: 20, fontWeight: '800' },
  hint: { color: UI.textDim, fontSize: 11, marginTop: 6, textAlign: 'center', paddingHorizontal: 16 },
});
