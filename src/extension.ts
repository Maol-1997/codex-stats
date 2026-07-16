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
import { initializeLogger, logger } from './utils/logger'

let updateInterval: NodeJS.Timeout | undefined

export function activate(context: vscode.ExtensionContext) {
  initializeLogger(context)
  logger.info('Codex Stats Monitor activated')

  const statusBarItem = createStatusBarItem()
  context.subscriptions.push(statusBarItem)

  registerCommands(context)
  loadAuthAndStartMonitoring()
}

async function loadAuthAndStartMonitoring() {
  try {
    logger.info('Loading Codex authentication')
    const authData = await loadAuthData()

    if (authData) {
      logger.info('Authentication loaded', {
        planType: authData.planType,
        accountIdPresent: !!authData.accountId,
      })

      initializeMonitor(authData)
      await updateUsage()

      const config = vscode.workspace.getConfiguration('codexUsage')
      const intervalSeconds = config.get<number>('updateInterval') || 300
      logger.info('Starting periodic usage updates', { intervalSeconds })

      if (updateInterval) {
        clearInterval(updateInterval)
      }

      updateInterval = setInterval(async () => {
        logger.info('Periodic usage update started')
        await updateUsage()
      }, intervalSeconds * 1000)
    } else {
      logger.warn('No usable Codex authentication was found')
      showAuthRequired()
    }
  } catch (error) {
    logger.error('Failed to load Codex authentication', {
      error: error instanceof Error ? error.message : String(error),
    })
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
