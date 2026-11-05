import { getDisplayPercent, LimitDisplayMode } from './limit-display'

/**
 * Create an emoji-based progress bar like cursor-stats
 */
export function createProgressBar(
  usedPercent: number,
  mode: LimitDisplayMode = 'used',
): string {
  // Emoji-based progress bar like cursor-stats
  const PROGRESS_EMPTY = '⬜'
  const PROGRESS_FILLED = '🟩'
  const PROGRESS_WARNING = '🟨'
  const PROGRESS_CRITICAL = '🟥'

  const length = 10 // Number of emoji blocks
  const warningThreshold = 75
  const criticalThreshold = 90

  // Ensure percentage is within 0-100 range
  const displayPercent = getDisplayPercent(usedPercent, mode)

  // Calculate filled positions
  const filledCount = Math.round((displayPercent / 100) * length)
  const emptyCount = length - filledCount

  // Choose emoji color based on thresholds
  let filledEmoji = PROGRESS_FILLED
  if (usedPercent >= criticalThreshold) {
    filledEmoji = PROGRESS_CRITICAL
  } else if (usedPercent >= warningThreshold) {
    filledEmoji = PROGRESS_WARNING
  }

  // Build the progress bar
  const bar =
    filledEmoji.repeat(filledCount) + PROGRESS_EMPTY.repeat(emptyCount)

  // Format with percentage aligned
  return `${bar}  **${displayPercent.toFixed(0)}% ${mode}**`
}
