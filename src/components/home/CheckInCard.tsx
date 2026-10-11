import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CheckInState } from '../../services/checkIn/streak';
import { useUi } from '../../theme/useUi';

interface Props {
  checkIn: CheckInState;
  toast: string | null;
  onCheckIn: () => void;
  onDismissToast: () => void;
}

export function CheckInCard({ checkIn, toast, onCheckIn, onDismissToast }: Props) {
  const UI = useUi();
  const styles = React.useMemo(() => makeStyles(UI), [UI]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismissToast, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismissToast]);

  const streak = checkIn.currentStreak;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.row}>
        <View style={styles.stats}>
          <Text style={styles.streakNum} accessibilityLabel={`Current streak ${streak} days`}>
            {streak > 0 ? `${streak}🔥` : '—'}
          </Text>
          <Text style={styles.streakLabel}>day streak</Text>
          {checkIn.longestStreak > 0 ? (
            <Text style={styles.best}>Best: {checkIn.longestStreak}</Text>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onCheckIn}
          accessibilityRole="button"
          accessibilityLabel="Daily check-in"
          accessibilityHint="Records today’s visit and grows your streak"
        >
          <Text style={styles.btnText}>Check in</Text>
        </Pressable>
      </View>
      {toast ? (
        <Pressable onPress={onDismissToast} accessibilityRole="text">
          <Text style={styles.toast}>{toast}</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>Show up once a day — streaks are local only.</Text>
      )}
    </View>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: UI.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stats: { flex: 1 },
  streakNum: { color: UI.text, fontWeight: '900', fontSize: 22 },
  streakLabel: { color: UI.textDim, fontSize: 12, marginTop: 2 },
  best: { color: UI.textMid, fontSize: 11, marginTop: 4 },
  btn: {
    backgroundColor: UI.surfaceHi,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: UI.accentLine,
  },
  btnPressed: { opacity: 0.88 },
  btnText: { color: UI.text, fontWeight: '800', fontSize: 14 },
  hint: { color: UI.textDim, fontSize: 11, marginTop: 10, lineHeight: 15 },
  toast: { color: UI.accent, fontSize: 12, marginTop: 10, fontWeight: '600' },
  });
}
