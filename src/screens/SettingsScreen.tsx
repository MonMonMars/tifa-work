import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompanionStore } from '../store/companionStore';
import { UI, inputFontSize } from '../theme/tokens';

interface Props {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: Props) {
  const {
    llmConfig,
    setLlmConfig,
    voiceConfig,
    setVoiceConfig,
    memoryNotes,
    rememberNote,
  } = useCompanionStore();
  const [memoryDraft, setMemoryDraft] = useState('');

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onClose}>
          <Text style={styles.back}>Done</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Brain (BYO OpenAI-compatible)</Text>
        <Text style={styles.help}>
          Keys stay on device only (AsyncStorage). When enabled with a valid base URL + API key,
          Weepo calls your provider's /chat/completions. Otherwise replies use offline banter.
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Enable LLM slot</Text>
          <Switch
            value={llmConfig.enabled}
            onValueChange={(enabled) => setLlmConfig({ enabled })}
          />
        </View>

        <Text style={styles.fieldLabel}>Base URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://api.openai.com/v1"
          placeholderTextColor={UI.textDim}
          autoCapitalize="none"
          value={llmConfig.baseUrl}
          onChangeText={(baseUrl) => setLlmConfig({ baseUrl })}
        />

        <Text style={styles.fieldLabel}>API key</Text>
        <TextInput
          style={styles.input}
          placeholder="sk-… (stored locally)"
          placeholderTextColor={UI.textDim}
          secureTextEntry
          autoCapitalize="none"
          value={llmConfig.apiKey}
          onChangeText={(apiKey) => setLlmConfig({ apiKey })}
        />

        <Text style={styles.fieldLabel}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="gpt-4o-mini"
          placeholderTextColor={UI.textDim}
          autoCapitalize="none"
          value={llmConfig.model}
          onChangeText={(model) => setLlmConfig({ model })}
        />

        <View style={[styles.row, { marginTop: 16 }]}>
          <Text style={styles.label}>Stream LLM tokens (M3.5)</Text>
          <Switch
            value={llmConfig.streamEnabled}
            onValueChange={(streamEnabled) => setLlmConfig({ streamEnabled })}
          />
        </View>

        <Text style={[styles.section, { marginTop: 24 }]}>Voice (on-device TTS)</Text>
        <Text style={styles.help}>
          Uses expo-speech / system voices — no API key. Assistant replies are read aloud when
          enabled. STT mic is a stub until a future build (see docs/VOICE.md).
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Speak replies</Text>
          <Switch
            value={voiceConfig.ttsEnabled}
            onValueChange={(ttsEnabled) => setVoiceConfig({ ttsEnabled })}
          />
        </View>

        <Text style={styles.fieldLabel}>Speech rate (0.75 – 1.25)</Text>
        <TextInput
          style={styles.input}
          placeholder="1.0"
          placeholderTextColor={UI.textDim}
          keyboardType="decimal-pad"
          value={String(voiceConfig.rate)}
          onChangeText={(raw) => {
            const n = parseFloat(raw);
            if (!Number.isFinite(n)) return;
            setVoiceConfig({ rate: Math.max(0.75, Math.min(1.25, n)) });
          }}
        />

        <Text style={styles.fieldLabel}>Voice locale (BCP-47)</Text>
        <TextInput
          style={styles.input}
          placeholder="en-US or zh-HK"
          placeholderTextColor={UI.textDim}
          autoCapitalize="none"
          value={voiceConfig.locale}
          onChangeText={(locale) => setVoiceConfig({ locale })}
        />

        <Text style={[styles.section, { marginTop: 24 }]}>Device memory (stub)</Text>
        <TextInput
          style={[styles.input, styles.memoryInput]}
          placeholder="Add a note the companion should remember…"
          placeholderTextColor={UI.textDim}
          value={memoryDraft}
          onChangeText={setMemoryDraft}
          multiline
        />
        <Pressable
          style={styles.memBtn}
          onPress={() => {
            rememberNote(memoryDraft);
            setMemoryDraft('');
          }}
        >
          <Text style={styles.memBtnText}>Save note</Text>
        </Pressable>

        {memoryNotes.length > 0 && (
          <View style={styles.memList}>
            {memoryNotes.map((n, i) => (
              <Text key={`${i}-${n.slice(0, 8)}`} style={styles.memItem}>
                · {n}
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.section, { marginTop: 28 }]}>Privacy & AI</Text>
        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            Weepo stores chats and settings on this device. With LLM enabled, your messages go to the
            API provider you configure — not a Mon Mon server. Replies are AI-generated, not human,
            and are not professional advice.
          </Text>
          <Text style={[styles.privacyText, { marginTop: 10 }]}>
            Full draft for App Store: see docs/PRIVACY.md in the repo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: UI.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: UI.hairline,
  },
  back: { color: UI.accent, fontWeight: '700', width: 48 },
  title: { color: UI.text, fontWeight: '800', fontSize: 17 },
  content: { padding: 16, paddingBottom: 40 },
  section: { color: UI.text, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  help: { color: UI.textDim, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { color: UI.textMid, fontSize: 14 },
  fieldLabel: { color: UI.textDim, fontSize: 12, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: UI.surfaceTop,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: UI.text,
    fontSize: inputFontSize(15),
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  memoryInput: { minHeight: 72, textAlignVertical: 'top' },
  memBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: UI.surfaceHi,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  memBtnText: { color: UI.text, fontWeight: '700' },
  memList: { marginTop: 16 },
  memItem: { color: UI.textMid, fontSize: 13, marginBottom: 6 },
  privacyBox: {
    backgroundColor: UI.surface,
    borderRadius: 3,
    padding: 14,
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  privacyText: { color: UI.textMid, fontSize: 13, lineHeight: 19 },
});
