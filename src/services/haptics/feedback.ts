import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Light tap on successful send — no-op on web / unsupported. */
export async function hapticOnSend(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* simulator or missing hardware */
  }
}

/** Slightly stronger tap on check-in success (not on same-day idempotent). */
export async function hapticOnCheckIn(success: boolean): Promise<void> {
  if (Platform.OS === 'web' || !success) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}
