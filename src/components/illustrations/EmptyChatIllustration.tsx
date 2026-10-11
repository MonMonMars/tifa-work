import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUi } from '../../theme/useUi';

interface Props {
  accentColor: string;
}

/** Pure View shapes — no image assets. */
export function EmptyChatIllustration({ accentColor }: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI, accentColor), [UI, accentColor]);

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.bubbleLeft} />
      <View style={styles.bubbleRight} />
      <View style={styles.dotRow}>
        <View style={[styles.dot, styles.dotA]} />
        <View style={[styles.dot, styles.dotB]} />
        <View style={[styles.dot, styles.dotC]} />
      </View>
      <View style={styles.ground} />
    </View>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>, accent: string) {
  return StyleSheet.create({
    wrap: {
      width: 132,
      height: 96,
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubbleLeft: {
      position: 'absolute',
      left: 8,
      top: 12,
      width: 52,
      height: 28,
      borderRadius: 3,
      backgroundColor: UI.surfaceTop,
      borderWidth: 1,
      borderColor: UI.hairline,
      transform: [{ rotate: '-4deg' }],
    },
    bubbleRight: {
      position: 'absolute',
      right: 6,
      top: 28,
      width: 64,
      height: 32,
      borderRadius: 3,
      backgroundColor: accent + '33',
      borderWidth: 1,
      borderColor: accent + '66',
      transform: [{ rotate: '3deg' }],
    },
    dotRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 36,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: accent,
      opacity: 0.35,
    },
    dotA: { opacity: 0.85 },
    dotB: { opacity: 0.55 },
    dotC: { opacity: 0.35 },
    ground: {
      position: 'absolute',
      bottom: 0,
      width: 100,
      height: 3,
      borderRadius: 2,
      backgroundColor: UI.hairline,
    },
  });
}
