export interface NotificationPrefs {
  /** User opt-in only — schedules at most one gentle daily local reminder (stub). */
  checkInRemindersEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  checkInRemindersEnabled: false,
};
