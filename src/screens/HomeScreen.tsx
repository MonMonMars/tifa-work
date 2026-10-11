import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarPlaceholder } from '../components/avatar/AvatarPlaceholder';
import { ExpressionPanel } from '../components/avatar/ExpressionPanel';
import { getPersona } from '../domain/personas';
import type { PersonaId } from '../domain/personas';
import type { ExpressionSnapshot } from '../expression/types';
import { UI } from '../theme/tokens';

interface Props {
  personaId: PersonaId;
  expression: ExpressionSnapshot;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onChangePersona: () => void;
  onProbeExpression: (label: string, weights: ExpressionSnapshot['weights']) => void;
}

export function HomeScreen({
  personaId,
  expression,
  onOpenChat,
  onOpenSettings,
  onChangePersona,
  onProbeExpression,
}: Props) {
  const persona = useMemo(() => getPersona(personaId), [personaId]);

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={onChangePersona} hitSlop={12}>
          <Text style={styles.personaBtn}>
            {persona.emoji} {persona.name}
          </Text>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={onOpenSettings} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stage}>
        <AvatarPlaceholder personaId={personaId} expression={expression} />
      </View>

      <ExpressionPanel
        expression={expression}
        onProbeEmotion={(label, weights) =>
          onProbeExpression(label, weights)
        }
      />

      <View style={styles.bottom}>
        <Pressable style={styles.chatCta} onPress={onOpenChat}>
          <Text style={styles.chatCtaText}>Open chat</Text>
        </Pressable>
        <Text style={styles.hint}>3D stays mounted here · chat opens as overlay (AIVA pattern)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: UI.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  personaBtn: { color: UI.text, fontWeight: '800', fontSize: 16 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  iconBtnText: { fontSize: 18 },
  stage: { flex: 1, marginHorizontal: 12, marginBottom: 8 },
  bottom: { paddingHorizontal: 16, paddingBottom: 16 },
  chatCta: {
    backgroundColor: UI.accent,
    paddingVertical: 14,
    borderRadius: 3,
    alignItems: 'center',
  },
  chatCtaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { color: UI.textDim, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
