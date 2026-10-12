import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UI } from '../theme/tokens';

interface Props {
  ready: boolean;
  onEnter?: () => void;
  returning?: boolean;
}

export function TitleScreen({ ready, onEnter, returning }: Props) {
  useEffect(() => {
    if (!ready || !onEnter) return;
    const t = setTimeout(onEnter, 900);
    return () => clearTimeout(t);
  }, [ready, onEnter]);

  return (
    <View style={styles.wrap}>
      <StatusBar style="light" />
      <Text style={styles.kicker}>MON MON · WEEPO · COMPANION B2C</Text>
      <Text style={styles.title}>Weepo</Text>
      <Text style={styles.sub}>
        {returning ? 'Welcome back — your companion is ready.' : 'AI avatar companion for chat & companionship'}
      </Text>
      {!ready ? (
        <>
          <ActivityIndicator color={UI.accent} style={{ marginTop: 32 }} />
          <Text style={styles.loadingHint}>Loading your companion on this device…</Text>
        </>
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
  loadingHint: { color: UI.textDim, fontSize: 12, marginTop: 14, textAlign: 'center', lineHeight: 17 },
  btn: {
    marginTop: 36,
    backgroundColor: UI.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 3,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
