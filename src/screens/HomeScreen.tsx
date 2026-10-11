import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarStage } from '../components/avatar/AvatarStage';
import { ExpressionPanel } from '../components/avatar/ExpressionPanel';
import { CheckInCard } from '../components/home/CheckInCard';
import { FocusSessionCard } from '../components/home/FocusSessionCard';
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
    avatarPokeToast,
    pokeAvatar,
    clearAvatarPokeToast,
    focusMinutesToday,
    focusActive,
    focusToast,
    startFocusSession,
    stopFocusSession,
    completeFocusSession,
    clearFocusToast,
    saveFocusWorkNote,
    focusLast7Days,
    focusActiveBreak,
    dismissFocusBreak,
  } = useCompanionStore();

  const { height: windowHeight } = useWindowDimensions();
  const compactHome = windowHeight < 700;
  const widgetMaxHeight = compactHome ? Math.min(260, Math.round(windowHeight * 0.36)) : undefined;

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

      <ScrollView
        style={widgetMaxHeight != null ? { maxHeight: widgetMaxHeight, flexGrow: 0 } : undefined}
        contentContainerStyle={compactHome ? styles.widgetScrollContent : undefined}
        showsVerticalScrollIndicator={compactHome}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <CheckInCard
          checkIn={checkIn}
          toast={checkInToast}
          onCheckIn={performCheckIn}
          onDismissToast={clearCheckInToast}
          compact={compactHome}
        />

        <FocusSessionCard
          minutesToday={focusMinutesToday}
          active={focusActive}
          focusToast={focusToast}
          onStart={startFocusSession}
          onStop={stopFocusSession}
          onComplete={completeFocusSession}
          onDismissToast={clearFocusToast}
          onSaveWorkNote={saveFocusWorkNote}
          last7Days={focusLast7Days}
          activeBreak={focusActiveBreak}
          onDismissBreak={dismissFocusBreak}
          compact={compactHome}
        />
      </ScrollView>

      <View style={[styles.stage, compactHome && styles.stageCompact]}>
        <AvatarStage
          personaId={personaId}
          expression={expression}
          isSpeaking={isSpeaking}
          pokeLine={avatarPokeToast}
          onPoke={pokeAvatar}
          onDismissPokeLine={clearAvatarPokeToast}
        />
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
          Tap avatar for a hello · emotions from chat · probes below
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
  widgetScrollContent: { paddingBottom: 4 },
  stage: { flex: 1, marginHorizontal: 12, marginBottom: 8, minHeight: 120 },
  stageCompact: { minHeight: 96, marginBottom: 4 },
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
