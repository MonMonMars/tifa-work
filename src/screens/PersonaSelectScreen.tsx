import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PERSONAS, type PersonaId } from '../domain/personas';
import { UI } from '../theme/tokens';

interface Props {
  onConfirm: (id: PersonaId) => void;
}

export function PersonaSelectScreen({ onConfirm }: Props) {
  const [selected, setSelected] = useState<PersonaId>('mika');

  return (
    <View style={styles.wrap}>
      <StatusBar style="light" />
      <Text style={styles.kicker}>CHOOSE COMPANION</Text>
      <Text style={styles.title}>Who feels right today?</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {PERSONAS.map((p) => {
          const active = p.id === selected;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.idBar, { backgroundColor: p.colors.primary }]} />
              <View style={styles.cardBody}>
                <Text style={styles.emoji}>{p.emoji}</Text>
                <View style={styles.meta}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.role}>{p.role}</Text>
                  <Text style={styles.tagline}>{p.tagline}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable style={styles.cta} onPress={() => onConfirm(selected)}>
        <Text style={styles.ctaText}>Start with {PERSONAS.find((p) => p.id === selected)?.name}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: UI.bg, paddingTop: 56 },
  kicker: {
    color: UI.textDim,
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 20,
  },
  title: {
    color: UI.text,
    fontSize: 26,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: UI.surface,
    borderRadius: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: UI.hairline,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: UI.accentLine,
    backgroundColor: UI.surfaceHi,
  },
  cardPressed: { opacity: 0.92 },
  idBar: { width: 4 },
  cardBody: { flex: 1, flexDirection: 'row', padding: 14, gap: 12 },
  emoji: { fontSize: 36 },
  meta: { flex: 1 },
  name: { color: UI.text, fontSize: 18, fontWeight: '800' },
  role: { color: UI.textDim, fontSize: 12, marginTop: 2 },
  tagline: { color: UI.textMid, fontSize: 13, marginTop: 8, lineHeight: 18 },
  cta: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: UI.accent,
    paddingVertical: 16,
    borderRadius: 3,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
