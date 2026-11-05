export type LimitDisplayMode = 'used' | 'left'

export function getDisplayPercent(
  usedPercent: number,
  mode: LimitDisplayMode,
): number {
  const clampedPercent = Math.max(0, Math.min(100, usedPercent))
  return mode === 'left' ? 100 - clampedPercent : clampedPercent
}
