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
import { sortMemoryNotesForDisplay } from '../domain/memoryNote';
import { formatMemoryExportText } from '../services/memory/exportMemoryNotes';
import { useCompanionStore } from '../store/companionStore';
import { inputFontSize } from '../theme/tokens';
import type { ThemeMode } from '../theme/palettes';
import { useUi } from '../theme/useUi';
import { settingsMatches } from './settingsFilter';

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
    togglePinMemoryNote,
    wipeAllLocalData,
    themeMode,
    setThemeMode,
    notificationPrefs,
    setNotificationPrefs,
    personaId,
    workCompanion,
    setWorkCompanionPrefs,
  } = useCompanionStore();
  const [memoryDraft, setMemoryDraft] = useState('');
  const [settingsQuery, setSettingsQuery] = useState('');
  const sortedMemoryNotes = useMemo(
    () => sortMemoryNotesForDisplay(memoryNotes),
    [memoryNotes],
  );

  const showBrain = settingsMatches(settingsQuery, [
    'brain',
    'llm',
    'openai',
    'api',
    'key',
    'model',
    'stream',
    'chat',
    'completions',
    'url',
  ]);
  const showVoice = settingsMatches(settingsQuery, [
    'voice',
    'tts',
    'speak',
    'banter',
    'speech',
    'locale',
    'rate',
    'language',
    '廣',
  ]);
  const showAppearance = settingsMatches(settingsQuery, ['appearance', 'theme', 'dark', 'light']);
  const showWork = settingsMatches(settingsQuery, [
    'work',
    'focus',
    'break',
    'tips',
    'companion',
    'session',
  ]);
  const showReminders = settingsMatches(settingsQuery, [
    'reminder',
    'notification',
    'check-in',
    'daily',
    'nudge',
  ]);
  const showMemory = settingsMatches(settingsQuery, ['memory', 'notes', 'export', 'remember']);
  const showData = settingsMatches(settingsQuery, ['delete', 'wipe', 'data', 'local', 'reset']);
  const showPrivacy = settingsMatches(settingsQuery, ['privacy', 'ai', 'store', 'provider']);
  const anySection =
    showBrain ||
    showVoice ||
    showAppearance ||
    showWork ||
    showReminders ||
    showMemory ||
    showData ||
    showPrivacy;

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

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter settings…"
          placeholderTextColor={UI.textDim}
          value={settingsQuery}
          onChangeText={setSettingsQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Filter settings"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!anySection && settingsQuery.trim() ? (
          <Text style={styles.emptyFilter}>No settings match “{settingsQuery.trim()}”.</Text>
        ) : null}

        {showBrain ? (
          <>
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
          </>
        ) : null}

        {showVoice ? (
          <>
        <Text style={[styles.section, { marginTop: showBrain ? 24 : 0 }]}>Voice (on-device TTS)</Text>
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
        <View style={styles.row}>
          <Text style={styles.label}>Haptic on send</Text>
          <Switch
            value={voiceConfig.hapticsOnSend}
            onValueChange={(hapticsOnSend) => setVoiceConfig({ hapticsOnSend })}
            accessibilityLabel="Light haptic feedback when sending a message"
          />
        </View>
        <Text style={[styles.help, { marginTop: -4, marginBottom: 12 }]}>
          Browser demo uses haptics only when supported — no bundled send sound.
        </Text>

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
          </>
        ) : null}

        {showAppearance ? (
          <>
        <Text style={[styles.section, { marginTop: showVoice || showBrain ? 24 : 0 }]}>Appearance</Text>
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
          </>
        ) : null}

        {showWork ? (
          <>
        <Text style={[styles.section, { marginTop: showAppearance || showVoice || showBrain ? 24 : 0 }]}>
          Work companion
        </Text>
        <Text style={styles.help}>
          Focus blocks on Home log minutes on device. Tips are offline encouragement on start/end — not LLM.
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Focus session tips</Text>
          <Switch
            value={workCompanion.tipsEnabled}
            onValueChange={(tipsEnabled) => setWorkCompanionPrefs({ tipsEnabled })}
            accessibilityLabel="Focus session companion tips"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>5 min break after focus</Text>
          <Switch
            value={workCompanion.breakReminderEnabled}
            onValueChange={(breakReminderEnabled) => setWorkCompanionPrefs({ breakReminderEnabled })}
            accessibilityLabel="Five minute soft break after completed focus"
          />
        </View>
          </>
        ) : null}

        {showReminders ? (
          <>
        <Text style={[styles.section, { marginTop: showWork || showAppearance || showVoice || showBrain ? 24 : 0 }]}>
          Reminders
        </Text>
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
          </>
        ) : null}

        {showMemory ? (
          <>
        <Text style={[styles.section, { marginTop: showReminders || showWork || showAppearance || showVoice || showBrain ? 24 : 0 }]}>
          Device memory (stub)
        </Text>
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

        {sortedMemoryNotes.length > 0 && (
          <View style={styles.memList}>
            {sortedMemoryNotes.map((n) => (
              <View key={n.text} style={styles.memRow}>
                <Text style={styles.memItem} numberOfLines={3}>
                  {n.pinned ? '📌 ' : '· '}
                  {n.text}
                </Text>
                <Pressable
                  onPress={() => togglePinMemoryNote(n.text)}
                  accessibilityRole="button"
                  accessibilityLabel={n.pinned ? 'Unpin memory note' : 'Pin memory note'}
                >
                  <Text style={styles.memPin}>{n.pinned ? 'Unpin' : 'Pin'}</Text>
                </Pressable>
              </View>
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
          </>
        ) : null}

        {showData ? (
          <>
        <Text style={[styles.section, { marginTop: showMemory ? 28 : 0 }]}>Data on this device</Text>
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
          </>
        ) : null}

        {showPrivacy ? (
          <>
        <Text style={[styles.section, { marginTop: showData || showMemory ? 28 : 0 }]}>Privacy & AI</Text>
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
          </>
        ) : null}

        <Text style={styles.footer}>Foundation build · v0.8.0 · tifa-work → weepo port</Text>
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
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: UI.hairline,
  },
  searchInput: {
    backgroundColor: UI.surfaceTop,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: UI.text,
    fontSize: inputFontSize(15),
    borderWidth: 1,
    borderColor: UI.hairline,
  },
  emptyFilter: { color: UI.textDim, fontSize: 14, marginBottom: 16, lineHeight: 20 },
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
  memRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  memItem: { color: UI.textMid, fontSize: 13, flex: 1 },
  memPin: { color: UI.accent, fontWeight: '700', fontSize: 12, paddingVertical: 2 },
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
