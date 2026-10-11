import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarStage } from '../components/avatar/AvatarStage';
import { ExpressionPanel } from '../components/avatar/ExpressionPanel';
import { CheckInCard } from '../components/home/CheckInCard';
import { getPersona } from '../domain/personas';
import type { PersonaId } from '../domain/personas';
import type { ExpressionSnapshot } from '../expression/types';
import { useCompanionStore } from '../store/companionStore';
import { useUi } from '../theme/useUi';

interface Props {
  personaId: PersonaId;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onChangePersona: () => void;
  onProbeExpression: (label: string, weights: ExpressionSnapshot['weights']) => void;
}

export function HomeScreen({
  personaId,
  onOpenChat,
  onOpenSettings,
  onChangePersona,
  onProbeExpression,
}: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);
  const persona = useMemo(() => getPersona(personaId), [personaId]);
  const {
    isSpeaking,
    expression,
    checkIn,
    checkInToast,
    performCheckIn,
    clearCheckInToast,
  } = useCompanionStore();

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={onChangePersona}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Companion ${persona.name}, change persona`}
        >
          <Text style={styles.personaBtn}>
            {persona.emoji} {persona.name}
          </Text>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable
            onPress={onOpenSettings}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text style={styles.iconBtnText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <CheckInCard
        checkIn={checkIn}
        toast={checkInToast}
        onCheckIn={performCheckIn}
        onDismissToast={clearCheckInToast}
      />

      <View style={styles.stage}>
        <AvatarStage personaId={personaId} expression={expression} />
      </View>

      <ExpressionPanel
        expression={expression}
        onProbeEmotion={(label, weights) =>
          onProbeExpression(label, weights)
        }
      />

      <View style={styles.bottom}>
        <Pressable
          style={styles.chatCta}
          onPress={onOpenChat}
          accessibilityRole="button"
          accessibilityLabel="Open chat"
        >
          <Text style={styles.chatCtaText}>Open chat</Text>
        </Pressable>
        <Text style={styles.hint}>
          {isSpeaking ? 'Speaking… · ' : ''}
          Avatar reacts to chat emotions · tap probes below
        </Text>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
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
}
