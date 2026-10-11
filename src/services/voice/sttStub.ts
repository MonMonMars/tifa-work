import type { SpeechToTextProvider } from './types';

/**
 * Placeholder STT — mic UI is wired, but no cloud/native STT in M4.
 * Future: expo-speech-recognition, on-device Apple Speech, or BYO websocket.
 */
export const sttStubProvider: SpeechToTextProvider = {
  id: 'stt-stub',
  label: 'Voice input (coming soon)',

  async isAvailable(): Promise<boolean> {
    return false;
  },

  async start(): Promise<void> {
    throw new Error('Speech-to-text is not enabled in this build. Use the keyboard for now.');
  },

  async stop(): Promise<void> {
    /* noop */
  },
};
