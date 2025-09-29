import * as vscode from 'vscode'
import { updateUsage } from '../services/usage-monitor'

/**
 * Register all extension commands
 */
export function registerCommands(context: vscode.ExtensionContext) {
  // No-op command just to show pointer cursor
  const noopCommand = vscode.commands.registerCommand(
    'codex-usage.noop',
    () => {
      // No-op command just to show pointer cursor
    },
  )

  // Refresh command
  const refreshCommand = vscode.commands.registerCommand(
    'codex-usage.refresh',
    async () => {
      await updateUsage()
    },
  )

  // Login command
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
          vscode.Uri.parse('https://github.com/openai/codex-cli'),
        )
      }
    },
  )

  // Register all commands
  context.subscriptions.push(noopCommand)
  context.subscriptions.push(refreshCommand)
  context.subscriptions.push(loginCommand)
}
