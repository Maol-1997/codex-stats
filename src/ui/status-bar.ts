import * as vscode from 'vscode'
import { RateLimits, AuthData } from '../types'
import { getDisplayPercent, LimitDisplayMode } from './limit-display'
import {
  createMainTooltip,
  createAuthRequiredTooltip,
  createAuthErrorTooltip,
  createUpdatingTooltip,
  createFetchErrorTooltip,
  createUpdateErrorTooltip,
} from './tooltip-builder'

let statusBarItem: vscode.StatusBarItem
let currentUsage: {
  rateLimits: RateLimits
  authData: AuthData
  updatedAt: Date
} | undefined

/**
 * Create and initialize the status bar item
 */
export function createStatusBarItem(): vscode.StatusBarItem {
  currentUsage = undefined
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
  currentUsage = { rateLimits, authData, updatedAt: new Date() }
  refreshStatusBar()
}

/**
 * Re-render the current usage after a display setting change without fetching.
 */
export function refreshStatusBar() {
  if (!currentUsage) {
    return
  }

  const { rateLimits, authData, updatedAt } = currentUsage
  const config = vscode.workspace.getConfiguration('codexUsage')
  const mode: LimitDisplayMode =
    config.get<string>('limitDisplay') === 'left' ? 'left' : 'used'
  const statusLimit = rateLimits.primary ?? rateLimits.secondary
  const label = statusLimit
    ? `${getDisplayPercent(statusLimit.used_percent, mode).toFixed(0)}%`
    : '--'

  // Update status bar text with custom icon - no colors
  statusBarItem.text = `$(codex-blossom) ${label}`
  statusBarItem.color = undefined
  statusBarItem.backgroundColor = undefined

  // Set tooltip
  statusBarItem.tooltip = createMainTooltip(
    rateLimits,
    authData,
    mode,
    updatedAt,
  )
}

/**
 * Show authentication required state
 */
export function showAuthRequired() {
  currentUsage = undefined
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.tooltip = createAuthRequiredTooltip()
  statusBarItem.command = 'codex-usage.noop' // Just for pointer cursor
}

/**
 * Show authentication error state
 */
export function showAuthError(error: any) {
  currentUsage = undefined
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.tooltip = createAuthErrorTooltip(error)
}

/**
 * Show updating state
 */
export function showUpdating() {
  currentUsage = undefined
  statusBarItem.text = '$(codex-blossom) $(sync~spin)'
  statusBarItem.color = undefined // Reset color while updating
  statusBarItem.tooltip = createUpdatingTooltip()
}

/**
 * Show fetch error state
 */
export function showFetchError() {
  currentUsage = undefined
  statusBarItem.text = '$(warning)'
  statusBarItem.color = new vscode.ThemeColor('editorWarning.foreground')
  statusBarItem.tooltip = createFetchErrorTooltip()
}

/**
 * Show update error state
 */
export function showUpdateError(error: any) {
  currentUsage = undefined
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
