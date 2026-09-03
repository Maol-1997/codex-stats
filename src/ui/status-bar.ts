import * as vscode from 'vscode'
import { RateLimits, AuthData, UsageDisplayMode } from '../types'
import {
  createMainTooltip,
  createAuthRequiredTooltip,
  createAuthErrorTooltip,
  createUpdatingTooltip,
  createFetchErrorTooltip,
  createUpdateErrorTooltip,
} from './tooltip-builder'

let statusBarItem: vscode.StatusBarItem
let currentRateLimits: RateLimits | undefined
let currentAuthData: AuthData | undefined
let currentUsageUpdatedAt: Date | undefined
let currentStatus: 'initializing' | 'success' | 'updating' | 'error' | 'auth' =
  'initializing'

/**
 * Create and initialize the status bar item
 */
export function createStatusBarItem(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  )

  // Set initial state with better styling
  statusBarItem.text = '$(codex-blossom) $(sync~spin)'
  statusBarItem.tooltip = 'Initializing Codex Stats Monitor...'
  statusBarItem.command = 'codex-usage.noop' // Just for pointer cursor
  statusBarItem.show()

  return statusBarItem
}

/**
 * Update status bar with rate limits data
 */
export function updateStatusBar(rateLimits: RateLimits, authData: AuthData) {
  currentRateLimits = rateLimits
  currentAuthData = authData
  currentUsageUpdatedAt = new Date()
  currentStatus = 'success'

  renderCurrentUsage()
}

function renderCurrentUsage() {
  if (!currentRateLimits || !currentAuthData || !currentUsageUpdatedAt) {
    return
  }

  const config = vscode.workspace.getConfiguration('codexUsage')
  const displayMode = config.get<UsageDisplayMode>('displayMode', 'used')

  // Determine usage percentages
  let primaryPercent = 0
  let secondaryPercent = 0
  let statusColor = 'charts.green'

  if (currentRateLimits.primary) {
    primaryPercent = currentRateLimits.primary.used_percent
  }

  if (currentRateLimits.secondary) {
    secondaryPercent = currentRateLimits.secondary.used_percent
  }

  const primaryDisplayPercent = getDisplayPercent(primaryPercent, displayMode)

  // Update status bar text with custom icon - no colors
  statusBarItem.text = `$(codex-blossom) ${primaryDisplayPercent.toFixed(0)}%`
  statusBarItem.color = undefined
  statusBarItem.backgroundColor = undefined

  // Set tooltip
  statusBarItem.tooltip = createMainTooltip(
    currentRateLimits,
    currentAuthData,
    primaryPercent,
    secondaryPercent,
    displayMode,
    currentUsageUpdatedAt,
  )
}

/**
 * Re-render the current usage data after a display setting changes
 */
export function refreshStatusBarDisplay() {
  if (currentStatus === 'success') {
    renderCurrentUsage()
  }
}

function getDisplayPercent(
  usedPercent: number,
  displayMode: UsageDisplayMode,
): number {
  return displayMode === 'remaining' ? 100 - usedPercent : usedPercent
}

/**
 * Show authentication required state
 */
export function showAuthRequired() {
  currentStatus = 'auth'
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.tooltip = createAuthRequiredTooltip()
  statusBarItem.command = 'codex-usage.noop' // Just for pointer cursor
}

/**
 * Show authentication error state
 */
export function showAuthError(error: any) {
  currentStatus = 'auth'
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.tooltip = createAuthErrorTooltip(error)
}

/**
 * Show updating state
 */
export function showUpdating() {
  currentStatus = 'updating'
  statusBarItem.text = '$(codex-blossom) $(sync~spin)'
  statusBarItem.color = undefined // Reset color while updating
  statusBarItem.tooltip = createUpdatingTooltip()
}

/**
 * Show fetch error state
 */
export function showFetchError() {
  currentStatus = 'error'
  statusBarItem.text = '$(warning)'
  statusBarItem.color = new vscode.ThemeColor('editorWarning.foreground')
  statusBarItem.tooltip = createFetchErrorTooltip()
}

/**
 * Show update error state
 */
export function showUpdateError(error: any) {
  currentStatus = 'error'
  statusBarItem.text = '$(warning)'
  statusBarItem.color = new vscode.ThemeColor('editorWarning.foreground')
  statusBarItem.tooltip = createUpdateErrorTooltip(error)
}

/**
 * Get the status bar item
 */
export function getStatusBarItem(): vscode.StatusBarItem {
  return statusBarItem
}
