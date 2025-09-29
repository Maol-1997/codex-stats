import * as vscode from 'vscode'
import { RateLimits, AuthData } from '../types'
import {
  createMainTooltip,
  createAuthRequiredTooltip,
  createAuthErrorTooltip,
  createUpdatingTooltip,
  createFetchErrorTooltip,
  createUpdateErrorTooltip,
} from './tooltip-builder'

let statusBarItem: vscode.StatusBarItem

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
  statusBarItem.tooltip = 'Initializing Codex Usage Monitor...'
  statusBarItem.command = 'codex-usage.noop' // Just for pointer cursor
  statusBarItem.show()

  return statusBarItem
}

/**
 * Update status bar with rate limits data
 */
export function updateStatusBar(rateLimits: RateLimits, authData: AuthData) {
  // Determine usage percentages
  let primaryPercent = 0
  let secondaryPercent = 0
  let statusColor = 'charts.green'

  if (rateLimits.primary) {
    primaryPercent = rateLimits.primary.used_percent
  }

  if (rateLimits.secondary) {
    secondaryPercent = rateLimits.secondary.used_percent
  }

  // Update status bar text with custom icon - no colors
  statusBarItem.text = `$(codex-blossom) ${primaryPercent.toFixed(0)}%`
  statusBarItem.color = undefined
  statusBarItem.backgroundColor = undefined

  // Set tooltip
  statusBarItem.tooltip = createMainTooltip(
    rateLimits,
    authData,
    primaryPercent,
    secondaryPercent,
  )
}

/**
 * Show authentication required state
 */
export function showAuthRequired() {
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.tooltip = createAuthRequiredTooltip()
  statusBarItem.command = 'codex-usage.noop' // Just for pointer cursor
}

/**
 * Show authentication error state
 */
export function showAuthError(error: any) {
  statusBarItem.text = '$(error)'
  statusBarItem.color = new vscode.ThemeColor('errorForeground')
  statusBarItem.tooltip = createAuthErrorTooltip(error)
}

/**
 * Show updating state
 */
export function showUpdating() {
  statusBarItem.text = '$(codex-blossom) $(sync~spin)'
  statusBarItem.color = undefined // Reset color while updating
  statusBarItem.tooltip = createUpdatingTooltip()
}

/**
 * Show fetch error state
 */
export function showFetchError() {
  statusBarItem.text = '$(warning)'
  statusBarItem.color = new vscode.ThemeColor('editorWarning.foreground')
  statusBarItem.tooltip = createFetchErrorTooltip()
}

/**
 * Show update error state
 */
export function showUpdateError(error: any) {
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
