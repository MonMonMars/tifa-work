import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UI } from '../theme/tokens';

interface Props {
  ready: boolean;
  onEnter?: () => void;
}

export function TitleScreen({ ready, onEnter }: Props) {
  useEffect(() => {
    if (!ready || !onEnter) return;
    const t = setTimeout(onEnter, 900);
    return () => clearTimeout(t);
  }, [ready, onEnter]);

  return (
    <View style={styles.wrap}>
      <StatusBar style="light" />
      <Text style={styles.kicker}>MON MON · COMPANION B2C</Text>
      <Text style={styles.title}>Companion</Text>
      <Text style={styles.sub}>AI avatar for chat & companionship</Text>
      {!ready ? (
        <ActivityIndicator color={UI.accent} style={{ marginTop: 32 }} />
      ) : (
        <Pressable style={styles.btn} onPress={onEnter}>
          <Text style={styles.btnText}>Enter</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: UI.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  kicker: {
    color: UI.textDim,
    letterSpacing: 3,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: { color: UI.text, fontSize: 42, fontWeight: '900' },
  sub: { color: UI.textMid, marginTop: 8, textAlign: 'center' },
  btn: {
    marginTop: 36,
    backgroundColor: UI.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 3,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
