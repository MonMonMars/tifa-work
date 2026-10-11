import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHECK_IN_REMINDER_ID = 'weepo-check-in-daily';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request OS permission — no-op schedule until user enables reminders in Settings. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelCheckInReminders(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(CHECK_IN_REMINDER_ID);
  } catch {
    /* id may not exist */
  }
}

/**
 * Stub: one daily local notification (~10:00 device local). Not enabled by default.
 * Full production scheduling should respect quiet hours + user timezone docs.
 */
export async function syncCheckInReminderSchedule(enabled: boolean): Promise<{ ok: boolean; reason?: string }> {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'web-unsupported' };
  }

  await cancelCheckInReminders();
  if (!enabled) return { ok: true };

  const permitted = await ensureNotificationPermission();
  if (!permitted) {
    return { ok: false, reason: 'permission-denied' };
  }

  await Notifications.scheduleNotificationAsync({
    identifier: CHECK_IN_REMINDER_ID,
    content: {
      title: 'Weepo · Check in',
      body: 'A quick hello — tap Check in when you have a moment.',
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 10,
      minute: 0,
    },
  });

  return { ok: true };
}
