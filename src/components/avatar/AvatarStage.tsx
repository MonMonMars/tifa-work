import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PersonaId } from '../../domain/personas';
import { getPersona } from '../../domain/personas';
import type { ExpressionSnapshot } from '../../expression/types';
import { UI } from '../../theme/tokens';
import { GlAvatarView } from './GlAvatarView';
import { MorphTargetPanel } from './MorphTargetPanel';

interface Props {
  personaId: PersonaId;
  expression: ExpressionSnapshot;
  isSpeaking: boolean;
  pokeLine: string | null;
  onPoke: () => void;
  onDismissPokeLine: () => void;
}

export function AvatarStage({
  personaId,
  expression,
  isSpeaking,
  pokeLine,
  onPoke,
  onDismissPokeLine,
}: Props) {
  const persona = getPersona(personaId);
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    if (!pokeLine) return;
    const t = setTimeout(onDismissPokeLine, 4500);
    return () => clearTimeout(t);
  }, [pokeLine, onDismissPokeLine]);

  return (
    <View style={styles.stage} accessibilityLabel="Companion avatar stage">
      <View style={[styles.glow, { backgroundColor: persona.colors.primary }]} />
      <Pressable
        style={styles.viewport}
        onPress={onPoke}
        accessibilityRole="button"
        accessibilityLabel={`Tap ${persona.name} avatar for a quick hello`}
        accessibilityHint="Plays a joy reaction and a short offline line"
      >
        {glFailed ? (
          <View style={styles.fallback}>
            <Text style={styles.emoji}>{persona.emoji}</Text>
            <Text style={styles.name}>{persona.name}</Text>
            <Text style={styles.hint}>WebGL unavailable — tap for banter</Text>
          </View>
        ) : (
          <GlAvatarView
            accentColor={persona.colors.primary}
            expression={expression}
            isSpeaking={isSpeaking}
            onFailed={() => setGlFailed(true)}
          />
        )}
        {pokeLine ? (
          <Pressable style={styles.pokeBubble} onPress={onDismissPokeLine}>
            <Text style={styles.pokeText} numberOfLines={3}>
              {pokeLine}
            </Text>
          </Pressable>
        ) : null}
      </Pressable>
      <MorphTargetPanel
        expression={expression}
        accentColor={persona.colors.primary}
        isSpeaking={isSpeaking}
      />
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
  pokeBubble: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  pokeText: { color: UI.text, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
