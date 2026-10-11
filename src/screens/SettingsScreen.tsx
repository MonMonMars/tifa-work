import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BANTER_PACK_LABELS, type BanterPack } from '../domain/banterLocale';
import { getPersona } from '../domain/personas';
import { formatMemoryExportText } from '../services/memory/exportMemoryNotes';
import { useCompanionStore } from '../store/companionStore';
import { inputFontSize } from '../theme/tokens';
import type { ThemeMode } from '../theme/palettes';
import { useUi } from '../theme/useUi';

const BANTER_OPTIONS: BanterPack[] = ['en', 'zh-HK', 'bilingual'];

interface Props {
  onClose: () => void;
  onWipedAllData?: () => void;
}

export function SettingsScreen({ onClose, onWipedAllData }: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);

  const {
    llmConfig,
    setLlmConfig,
    voiceConfig,
    setVoiceConfig,
    memoryNotes,
    rememberNote,
    wipeAllLocalData,
    themeMode,
    setThemeMode,
    notificationPrefs,
    setNotificationPrefs,
    personaId,
  } = useCompanionStore();
  const [memoryDraft, setMemoryDraft] = useState('');

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Done, close settings">
          <Text style={styles.back}>Done</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">
          Settings
        </Text>
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
            accessibilityLabel="Enable LLM"
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
          accessibilityLabel="LLM base URL"
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
          accessibilityLabel="LLM API key"
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
            accessibilityLabel="Stream LLM tokens"
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
            accessibilityLabel="Speak assistant replies"
          />
        </View>

        <Text style={styles.fieldLabel}>Offline banter language</Text>
        <Text style={styles.help}>
          Used when LLM is off or falls back. No network — bundled copy only.
        </Text>
        <View style={styles.rateRow}>
          {BANTER_OPTIONS.map((pack) => (
            <Pressable
              key={pack}
              style={[styles.rateChip, voiceConfig.banterPack === pack && styles.rateChipOn]}
              onPress={() => setVoiceConfig({ banterPack: pack })}
              accessibilityRole="button"
              accessibilityLabel={`Banter language ${BANTER_PACK_LABELS[pack]}`}
              accessibilityState={{ selected: voiceConfig.banterPack === pack }}
            >
              <Text
                style={[
                  styles.rateChipText,
                  voiceConfig.banterPack === pack && styles.rateChipTextOn,
                ]}
              >
                {pack === 'zh-HK' ? '廣' : pack === 'bilingual' ? 'EN+廣' : 'EN'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Speech rate (0.75 – 1.25)</Text>
        <View style={styles.rateRow}>
          {(
            [
              { label: 'Slower', rate: 0.85 },
              { label: 'Normal', rate: 1.0 },
              { label: 'Faster', rate: 1.15 },
            ] as const
          ).map(({ label, rate }) => (
            <Pressable
              key={label}
              style={[styles.rateChip, voiceConfig.rate === rate && styles.rateChipOn]}
              onPress={() => setVoiceConfig({ rate })}
            >
              <Text
                style={[styles.rateChipText, voiceConfig.rate === rate && styles.rateChipTextOn]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
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

        <Text style={[styles.section, { marginTop: 24 }]}>Appearance</Text>
        <View style={styles.rateRow}>
          {(['dark', 'light'] as ThemeMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[styles.rateChip, themeMode === mode && styles.rateChipOn]}
              onPress={() => setThemeMode(mode)}
              accessibilityRole="button"
              accessibilityLabel={`${mode} theme`}
              accessibilityState={{ selected: themeMode === mode }}
            >
              <Text style={[styles.rateChipText, themeMode === mode && styles.rateChipTextOn]}>
                {mode === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.section, { marginTop: 24 }]}>Reminders</Text>
        <Text style={styles.help}>
          Optional local nudge once per day (~10:00 device time). Off by default — see docs/NOTIFICATIONS.md.
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Daily check-in reminder</Text>
          <Switch
            value={notificationPrefs.checkInRemindersEnabled}
            onValueChange={(checkInRemindersEnabled) =>
              void setNotificationPrefs({ checkInRemindersEnabled })
            }
            accessibilityLabel="Daily check-in reminder"
          />
        </View>

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

        <Pressable
          style={[styles.memBtn, { marginTop: memoryNotes.length > 0 ? 8 : 0 }]}
          onPress={() => {
            const personaName = personaId ? getPersona(personaId).name : undefined;
            const message = formatMemoryExportText(memoryNotes, { personaName });
            void Share.share({
              title: 'Weepo memory notes',
              message,
            });
          }}
          accessibilityRole="button"
          accessibilityLabel="Export memory notes as text"
        >
          <Text style={styles.memBtnText}>Export notes as text</Text>
        </Pressable>
        <Text style={[styles.help, { marginTop: 8, marginBottom: 0 }]}>
          Opens the system share sheet — plain text only, no API keys.
        </Text>

        <Text style={[styles.section, { marginTop: 28 }]}>Data on this device</Text>
        <Text style={styles.help}>
          Removes chats, memory notes, LLM key, and persona choice from this phone. You will go back
          to the title screen.
        </Text>
        <Pressable
          style={styles.dangerBtn}
          onPress={() => {
            Alert.alert(
              'Delete all local data?',
              'This cannot be undone. Your API key and chat history will be removed from this device only.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete everything',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      await wipeAllLocalData();
                      onClose();
                      onWipedAllData?.();
                    })();
                  },
                },
              ],
            );
          }}
        >
          <Text style={styles.dangerBtnText}>Delete all local data</Text>
        </Pressable>

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

        <Text style={styles.footer}>Foundation build · v0.6.0 · tifa-work → weepo port</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
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
  rateRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  rateChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: UI.hairline,
    backgroundColor: UI.surfaceTop,
    alignItems: 'center',
  },
  rateChipOn: { borderColor: UI.accentLine, backgroundColor: UI.accentSoft },
  rateChipText: { color: UI.textMid, fontSize: 13, fontWeight: '600' },
  rateChipTextOn: { color: UI.text },
  dangerBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#5c2a2a',
    backgroundColor: '#2a1515',
    alignItems: 'center',
  },
  dangerBtnText: { color: '#ffb4b4', fontWeight: '800', fontSize: 14 },
  footer: {
    marginTop: 28,
    color: UI.textDim,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  });
}
