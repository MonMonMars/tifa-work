/** 0–1 mouth-open amount for placeholder morph / mesh squash (TTS speaking stub). */
export function lipSyncAmountFromPhase(phaseSeconds: number, speaking: boolean): number {
  if (!speaking) return 0;
  return 0.25 + Math.abs(Math.sin(phaseSeconds * 14)) * 0.55;
}
