import * as vscode from 'vscode'
import { loadAuthData } from './auth/auth-manager'
import {
  createStatusBarItem,
  showAuthRequired,
  showAuthError,
  getStatusBarItem,
} from './ui/status-bar'
import { initializeMonitor, updateUsage } from './services/usage-monitor'
import { registerCommands } from './commands'

let updateInterval: NodeJS.Timeout | undefined

export function activate(context: vscode.ExtensionContext) {
  console.log('Codex Usage Monitor is now active!')

  // Create status bar item
  const statusBarItem = createStatusBarItem()
  context.subscriptions.push(statusBarItem)

  // Register all commands
  registerCommands(context)

  // Load auth and start monitoring
  loadAuthAndStartMonitoring()
}

async function loadAuthAndStartMonitoring() {
  try {
    console.log('Loading auth and starting monitoring...')
    // Try to load auth data
    const authData = await loadAuthData()

    if (authData) {
      console.log('Auth data loaded successfully')
      console.log('Email:', authData.email)
      console.log('Plan:', authData.planType)

      // Initialize the monitor with auth data
      initializeMonitor(authData)

      // Update immediately
      console.log('Performing initial update...')
      await updateUsage()

      // Start periodic updates (default 5 minutes)
      const config = vscode.workspace.getConfiguration('codexUsage')
      const intervalSeconds = config.get<number>('updateInterval') || 300
      console.log(`Setting update interval to ${intervalSeconds} seconds`)

      if (updateInterval) {
        clearInterval(updateInterval)
      }

      updateInterval = setInterval(async () => {
        console.log('Periodic update triggered')
        await updateUsage()
      }, intervalSeconds * 1000)
    } else {
      console.log('No auth data found')
      showAuthRequired()
    }
  } catch (error) {
    console.error('Error loading auth:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    showAuthError(error)
  }
}

export function deactivate() {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  const statusBarItem = getStatusBarItem()
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
