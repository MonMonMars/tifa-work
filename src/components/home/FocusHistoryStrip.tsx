import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FocusDayBar } from '../../services/focus/focusHistory';
import { useUi } from '../../theme/useUi';

interface Props {
  days: FocusDayBar[];
  compact?: boolean;
}

export function FocusHistoryStrip({ days, compact }: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI, compact), [UI, compact]);
  const max = Math.max(1, ...days.map((d) => d.minutes));

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} accessibilityLabel="Focus minutes last seven days">
      <Text style={styles.title}>Last 7 days</Text>
      <View style={styles.row}>
        {days.map((d) => {
          const barMax = compact ? 28 : 36;
          const h = d.minutes > 0 ? Math.max(4, Math.round((d.minutes / max) * barMax)) : 2;
          return (
            <View key={d.dayKey} style={styles.col}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: h, opacity: d.minutes > 0 ? 1 : 0.25 }]} />
              </View>
              <Text style={styles.min}>{d.minutes > 0 ? d.minutes : '·'}</Text>
              <Text style={styles.wd}>{d.weekday}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>, compact?: boolean) {
  return StyleSheet.create({
    wrapCompact: { marginTop: 6 },
    wrap: { marginTop: 10 },
    title: { color: UI.textDim, fontSize: 10, fontWeight: '700', marginBottom: 6 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
    col: { flex: 1, alignItems: 'center' },
    barTrack: {
      height: compact ? 32 : 40,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    barFill: {
      width: '70%',
      minWidth: 6,
      backgroundColor: UI.accent,
      borderRadius: 2,
    },
    min: { color: UI.textMid, fontSize: 9, marginTop: 4, fontWeight: '700' },
    wd: { color: UI.textDim, fontSize: 9, marginTop: 2 },
  });
}
