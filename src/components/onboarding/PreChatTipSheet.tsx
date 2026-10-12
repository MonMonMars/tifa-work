import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUi } from '../../theme/useUi';

interface Props {
  visible: boolean;
  personaName: string;
  onContinue: () => void;
}

export function PreChatTipSheet({ visible, personaName, onContinue }: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onContinue}
    >
      <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.kicker}>Before you chat</Text>
        <Text style={styles.title} accessibilityRole="header">
          Hi — quick tips with {personaName}
        </Text>

        <View style={styles.card}>
          <Text style={styles.bullet}>· Chats stay on this device unless you turn on BYO LLM in Settings.</Text>
          <Text style={styles.bullet}>· Replies are AI-generated — not human, not professional advice.</Text>
          <Text style={styles.bullet}>· Offline banter works with no API key; expression morphs on Home.</Text>
          <Text style={styles.bullet}>· You can delete everything anytime in Settings.</Text>
        </View>

        <Text style={styles.privacy}>
          Privacy one-liner: Weepo does not run a Mon Mon server for your messages — with LLM enabled,
          only the provider you configure receives them.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue to chat"
        >
          <Text style={styles.btnText}>Got it — open chat</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: UI.bg,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    kicker: { color: UI.accent, fontWeight: '700', fontSize: 13, marginBottom: 6 },
    title: { color: UI.text, fontWeight: '900', fontSize: 22, lineHeight: 28, marginBottom: 20 },
    card: {
      backgroundColor: UI.surface,
      borderRadius: 3,
      padding: 16,
      borderWidth: 1,
      borderColor: UI.hairline,
      gap: 10,
      marginBottom: 16,
    },
    bullet: { color: UI.textMid, fontSize: 14, lineHeight: 20 },
    privacy: { color: UI.textDim, fontSize: 13, lineHeight: 19, marginBottom: 24 },
    btn: {
      backgroundColor: UI.accent,
      paddingVertical: 14,
      borderRadius: 3,
      alignItems: 'center',
    },
    btnPressed: { opacity: 0.9 },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
}
