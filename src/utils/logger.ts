import * as vscode from 'vscode'

let outputChannel: vscode.OutputChannel | undefined

export function initializeLogger(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Codex Stats')
  context.subscriptions.push(outputChannel)
}

export function showLogs() {
  outputChannel?.show(true)
}

function sanitizeString(value: string): string {
  return value
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]')
    .replace(/\/\/([^/@\s]+)@/g, '//[redacted]@')
}

function formatDetails(details?: Record<string, unknown>): string {
  if (!details) {
    return ''
  }

  try {
    return ` ${JSON.stringify(details, (key, value) => {
      if (/token|authorization|password|secret/i.test(key)) {
        return '[redacted]'
      }

      return typeof value === 'string' ? sanitizeString(value) : value
    })}`
  } catch {
    return ' {"details":"unserializable"}'
  }
}

function write(
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  details?: Record<string, unknown>,
) {
  outputChannel?.appendLine(
    `[${new Date().toISOString()}] [${level}] ${sanitizeString(message)}${formatDetails(details)}`,
  )
}

export const logger = {
  info(message: string, details?: Record<string, unknown>) {
    write('INFO', message, details)
  },
  warn(message: string, details?: Record<string, unknown>) {
    write('WARN', message, details)
  },
  error(message: string, details?: Record<string, unknown>) {
    write('ERROR', message, details)
  },
}
