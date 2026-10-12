import * as Speech from 'expo-speech';
import type { SpeakOptions, TextToSpeechService } from './types';
import { stripForSpeech } from './speechText';

export { stripForSpeech } from './speechText';

function speechParams(emotionTag?: string, userRate = 1): { pitch: number; rate: number; volume: number } {
  let pitch = 1;
  let rate = Math.max(0.75, Math.min(1.25, userRate));
  const tag = (emotionTag ?? '').toLowerCase();

  switch (tag) {
    case 'joy':
    case 'affection':
      pitch = 1.08;
      rate = Math.min(1.2, rate * 1.05);
      break;
    case 'sadness':
      pitch = 0.92;
      rate = Math.max(0.8, rate * 0.92);
      break;
    case 'anger':
      pitch = 0.95;
      rate = Math.min(1.15, rate * 1.08);
      break;
    case 'fear':
      pitch = 1.05;
      rate = Math.max(0.85, rate * 0.95);
      break;
    case 'surprise':
      pitch = 1.12;
      break;
    case 'thinking':
      rate = Math.max(0.82, rate * 0.9);
      break;
    default:
      break;
  }

  return { pitch, rate, volume: 1 };
}

export const deviceTts: TextToSpeechService = {
  speak(text: string, options?: SpeakOptions): Promise<void> {
    const cleaned = stripForSpeech(text);
    if (!cleaned) return Promise.resolve();

    const locale = options?.locale ?? 'en-US';
    const userRate = options?.rate ?? 1;
    const { pitch, rate, volume } = speechParams(options?.emotionTag, userRate);

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const estMs = Math.max(5000, (cleaned.length / 4) * 1000 + 3000);
      const timer = setTimeout(finish, estMs);

      try {
        Speech.speak(cleaned, {
          language: locale,
          pitch,
          rate,
          volume,
          onDone: () => {
            clearTimeout(timer);
            finish();
          },
          onStopped: () => {
            clearTimeout(timer);
            finish();
          },
          onError: () => {
            clearTimeout(timer);
            finish();
          },
        });
      } catch {
        clearTimeout(timer);
        finish();
      }
    });
  },

  stop(): Promise<void> {
    try {
      return Promise.resolve(Speech.stop()).catch(() => undefined);
    } catch {
      return Promise.resolve();
    }
  },
};
