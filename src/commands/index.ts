import * as vscode from 'vscode'
import { updateUsage } from '../services/usage-monitor'
import { showLogs } from '../utils/logger'

/**
 * Register all extension commands
 */
export function registerCommands(context: vscode.ExtensionContext) {
  const noopCommand = vscode.commands.registerCommand(
    'codex-usage.noop',
    () => {
      // No-op command just to show pointer cursor
    },
  )

  const refreshCommand = vscode.commands.registerCommand(
    'codex-usage.refresh',
    async () => {
      await updateUsage()
    },
  )

  const showLogsCommand = vscode.commands.registerCommand(
    'codex-usage.showLogs',
    () => {
      showLogs()
    },
  )

  const loginCommand = vscode.commands.registerCommand(
    'codex-usage.login',
    async () => {
      const selection = await vscode.window.showInformationMessage(
        'You need to authenticate with Codex to use this extension.',
        'Open Terminal',
        'Copy Command',
        'Help',
      )

      if (selection === 'Open Terminal') {
        vscode.commands.executeCommand('workbench.action.terminal.new')
        setTimeout(() => {
          vscode.commands.executeCommand(
            'workbench.action.terminal.sendSequence',
            {
              text: 'codex login\n',
            },
          )
        }, 500)
      } else if (selection === 'Copy Command') {
        vscode.env.clipboard.writeText('codex login')
        vscode.window.showInformationMessage(
          'Command "codex login" copied to clipboard!',
        )
      } else if (selection === 'Help') {
        vscode.env.openExternal(
          vscode.Uri.parse('https://github.com/openai/codex'),
        )
      }
    },
  )

  context.subscriptions.push(
    noopCommand,
    refreshCommand,
    showLogsCommand,
    loginCommand,
  )
}
