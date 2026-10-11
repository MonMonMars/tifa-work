import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FocusHistoryStrip } from './FocusHistoryStrip';
import type { FocusDayBar } from '../../services/focus/focusHistory';
import {
  FOCUS_PRESET_MINUTES,
  getBreakRemainingSeconds,
  getRemainingSeconds,
  isBreakComplete,
  isSessionComplete,
} from '../../services/focus/focusSession';
import type { FocusPreset, FocusSoftBreak } from '../../services/focus/types';
import { inputFontSize } from '../../theme/tokens';
import { useUi } from '../../theme/useUi';

interface Props {
  minutesToday: number;
  active: {
    startedAtMs: number;
    durationMinutes: number;
    preset: FocusPreset;
  } | null;
  focusToast: string | null;
  onStart: (minutes: number, preset: FocusPreset) => void;
  onStop: () => void;
  onComplete: () => void;
  onDismissToast: () => void;
  onSaveWorkNote: (note: string) => void;
  last7Days: FocusDayBar[];
  activeBreak: FocusSoftBreak | null;
  onDismissBreak: () => void;
}

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function FocusSessionCard({
  minutesToday,
  active,
  focusToast,
  onStart,
  onStop,
  onComplete,
  onDismissToast,
  onSaveWorkNote,
  last7Days,
  activeBreak,
  onDismissBreak,
}: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);
  const [customMin, setCustomMin] = useState('40');
  const [tick, setTick] = useState(0);
  const [noteModal, setNoteModal] = useState(false);
  const [workNote, setWorkNote] = useState('');
  const autoCompleteRef = useRef(false);

  useEffect(() => {
    if (!focusToast) return;
    const t = setTimeout(onDismissToast, 5000);
    return () => clearTimeout(t);
  }, [focusToast, onDismissToast]);

  useEffect(() => {
    if (!active && !activeBreak) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active, activeBreak]);

  useEffect(() => {
    if (!activeBreak) return;
    if (isBreakComplete(activeBreak, Date.now())) {
      onDismissBreak();
    }
  }, [activeBreak, tick, onDismissBreak]);

  useEffect(() => {
    if (!active) return;
    const now = Date.now();
    if (isSessionComplete(active, now) && !autoCompleteRef.current) {
      autoCompleteRef.current = true;
      onComplete();
      setNoteModal(true);
    }
  }, [active, tick, onComplete]);

  const remaining = active ? getRemainingSeconds(active, Date.now()) : 0;
  const breakRemaining = activeBreak ? getBreakRemainingSeconds(activeBreak, Date.now()) : 0;

  const startPreset = (preset: FocusPreset) => {
    const minutes =
      preset === 'p25'
        ? FOCUS_PRESET_MINUTES.p25
        : preset === 'p50'
          ? FOCUS_PRESET_MINUTES.p50
          : parseInt(customMin, 10) || 25;
    onStart(minutes, preset);
  };

  const closeNoteModal = () => {
    setNoteModal(false);
    setWorkNote('');
  };

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.row}>
        <View style={styles.stats}>
          <Text style={styles.label}>Focus today</Text>
          <Text style={styles.minutes} accessibilityLabel={`${minutesToday} focus minutes today`}>
            {minutesToday} min
          </Text>
        </View>
        {active ? (
          <View style={styles.running}>
            <Text style={styles.timer} accessibilityLiveRegion="polite">
              {formatCountdown(remaining)}
            </Text>
            <Pressable
              style={styles.stopBtn}
              onPress={() => {
                onStop();
                setNoteModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Stop focus session"
            >
              <Text style={styles.stopText}>Stop</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.presets}>
            {(['p25', 'p50'] as FocusPreset[]).map((p) => (
              <Pressable
                key={p}
                style={styles.chip}
                onPress={() => startPreset(p)}
                accessibilityRole="button"
                accessibilityLabel={`Start ${p === 'p25' ? 25 : 50} minute focus`}
              >
                <Text style={styles.chipText}>{p === 'p25' ? '25m' : '50m'}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {!active ? (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customMin}
            onChangeText={setCustomMin}
            keyboardType="number-pad"
            placeholder="Custom min"
            placeholderTextColor={UI.textDim}
            accessibilityLabel="Custom focus minutes"
          />
          <Pressable
            style={styles.customBtn}
            onPress={() => startPreset('custom')}
            accessibilityRole="button"
            accessibilityLabel="Start custom focus session"
          >
            <Text style={styles.customBtnText}>Start</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.hint}>Work block in progress — companion tips if enabled in Settings.</Text>
      )}

      {activeBreak && !active ? (
        <View style={styles.breakRow}>
          <Text style={styles.breakLabel}>Soft break · {formatCountdown(breakRemaining)}</Text>
          <Pressable onPress={onDismissBreak} accessibilityRole="button">
            <Text style={styles.breakSkip}>Skip</Text>
          </Pressable>
        </View>
      ) : null}

      <FocusHistoryStrip days={last7Days} />

      {focusToast ? (
        <Pressable onPress={onDismissToast}>
          <Text style={styles.toast}>{focusToast}</Text>
        </Pressable>
      ) : null}

      <Modal visible={noteModal} transparent animationType="fade" onRequestClose={closeNoteModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Session ended</Text>
            <Text style={styles.modalSub}>Optional work note (saved to device memory only)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What did you finish?"
              placeholderTextColor={UI.textDim}
              value={workNote}
              onChangeText={setWorkNote}
              multiline
              accessibilityLabel="Work check-in note"
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeNoteModal} style={styles.modalSkip}>
                <Text style={styles.modalSkipText}>Skip</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (workNote.trim()) onSaveWorkNote(workNote);
                  closeNoteModal();
                }}
                style={styles.modalSave}
              >
                <Text style={styles.modalSaveText}>Save note</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
    wrap: {
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 12,
      backgroundColor: UI.surface,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stats: { flex: 1 },
    label: { color: UI.textDim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    minutes: { color: UI.text, fontWeight: '900', fontSize: 20, marginTop: 2 },
    presets: { flexDirection: 'row', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: UI.accentLine,
      backgroundColor: UI.surfaceHi,
    },
    chipText: { color: UI.text, fontWeight: '800', fontSize: 14 },
    running: { alignItems: 'flex-end', gap: 6 },
    timer: { color: UI.accent, fontWeight: '900', fontSize: 22, fontVariant: ['tabular-nums'] },
    stopBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    stopText: { color: UI.textMid, fontWeight: '700', fontSize: 13 },
    customRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
    customInput: {
      flex: 1,
      backgroundColor: UI.surfaceTop,
      borderRadius: 3,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: UI.text,
      fontSize: inputFontSize(14),
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    customBtn: {
      backgroundColor: UI.accent,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 3,
    },
    customBtnText: { color: '#fff', fontWeight: '800' },
    hint: { color: UI.textDim, fontSize: 11, marginTop: 8 },
    toast: { color: UI.accent, fontSize: 12, marginTop: 8, fontWeight: '600', lineHeight: 17 },
    breakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: UI.surfaceTop,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    breakLabel: { color: UI.textMid, fontSize: 12, fontWeight: '700' },
    breakSkip: { color: UI.accent, fontWeight: '800', fontSize: 12 },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: UI.surface,
      borderRadius: 3,
      padding: 16,
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    modalTitle: { color: UI.text, fontWeight: '900', fontSize: 17 },
    modalSub: { color: UI.textDim, fontSize: 12, marginTop: 6, marginBottom: 12 },
    noteInput: {
      minHeight: 72,
      backgroundColor: UI.surfaceTop,
      borderRadius: 3,
      padding: 10,
      color: UI.text,
      fontSize: inputFontSize(14),
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 14 },
    modalSkip: { paddingVertical: 10, paddingHorizontal: 8 },
    modalSkipText: { color: UI.textDim, fontWeight: '700' },
    modalSave: {
      backgroundColor: UI.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 3,
    },
    modalSaveText: { color: '#fff', fontWeight: '800' },
  });
}
