import type { BanterPack } from '../../domain/banterLocale';

export interface VoiceConfig {
  /** Speak assistant replies with on-device TTS (expo-speech). */
  ttsEnabled: boolean;
  /** User speed multiplier; 1.0 = normal (Expo: rate 1.0 on iOS/Android). */
  rate: number;
  /** BCP-47 locale passed to the system voice engine. */
  locale: string;
  /** Offline banter language pack when LLM is off or fallback. */
  banterPack: BanterPack;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  ttsEnabled: true,
  rate: 1,
  locale: 'en-US',
  banterPack: 'bilingual',
};

export interface SpeakOptions {
  locale?: string;
  rate?: number;
  emotionTag?: string;
}

export interface TextToSpeechService {
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): Promise<void>;
}

/** STT is not implemented in M4 — interface only for a future provider. */
export interface SpeechToTextProvider {
  readonly id: string;
  readonly label: string;
  isAvailable(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
