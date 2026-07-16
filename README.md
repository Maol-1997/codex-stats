# Codex Stats Monitor

Monitor your ChatGPT/Codex Stats and rate limits directly in VS Code's status bar.

## Features

- 📊 **Real-time Usage Display**: Shows your current rate limit usage percentage in the status bar
- 👤 **Account Information**: Displays your email and plan type in the tooltip
- ⏱️ **Auto-refresh**: Updates every 5 minutes (configurable)
- ⚠️ **Usage Warnings**: Visual indicators when approaching rate limits
- 🔄 **Manual Refresh**: Click the status bar item to refresh immediately
- 🌐 **Proxy Support**: Route usage requests through a configurable HTTP/HTTPS proxy
- 🧰 **Diagnostic Logs**: Inspect redacted request and parsing details in VS Code's Output panel

## How it Works

The extension reads your Codex authentication from `~/.codex/auth.json` (created by `codex login`) and queries ChatGPT's dedicated `/backend-api/wham/usage` endpoint. It does not create a model response just to discover rate limits.

## Visual Design

The extension features a beautiful, modern interface inspired by GitHub Copilot:

### Status Bar

- **Color-coded indicators**: Green (safe), Yellow (warning), Red (critical)
- **Dynamic background**: Changes color based on usage level
- **Clean format**: Shows percentage with Codex branding

### Enhanced Tooltip

Hover over the status bar item to see a beautifully formatted panel with:

#### Account Information

- 📧 Email address with monospace formatting
- 📦 Plan type in uppercase
- Clean section separators

#### Usage Visualization

- **Visual progress bars** using colored emoji indicators:
  - 🟢 Green circles for usage below 80%
  - 🟡 Yellow circles for usage 80-95%
  - 🔴 Red circles for usage above 95%
- **Time-based limits**: 5-hour and 7-day windows
- **Smart reset timers**: Shows time remaining in human-readable format
- **Icon indicators**: Clock for hourly, calendar for weekly limits

### Interactive Features

- **One-click refresh**: Updates immediately when clicked
- **Smart login flow**: Multiple options when authentication needed:
  - Open terminal with command pre-filled
  - Copy command to clipboard
  - Access help documentation

## Installation

1. Clone this repository
2. Open the `codex-usage` folder in VS Code
3. Run `npm install`
4. Run `npm run compile`
5. Press `F5` to launch a new VS Code window with the extension

## Building the Extension

To create a `.vsix` file for installation:

```bash
npm install -g vsce
cd codex-usage
vsce package
```

Then install the generated `.vsix` file in VS Code.

## Configuration

You can configure the extension in VS Code settings:

- `codexUsage.updateInterval`: Update interval in seconds (default: 300)
- `codexUsage.showNotifications`: Show notifications when rate limits are high (default: false)
- `codexUsage.proxyUrl`: Optional HTTP/HTTPS proxy URL, including URL-encoded credentials when required (default: empty)

Proxy changes take effect on the next automatic or manual refresh.

## Prerequisites

- You must be logged in to Codex (`codex login`)
- The extension reads auth data from `~/.codex/auth.json`

## Troubleshooting

If you see "Need to login":

1. Run `codex login` in your terminal
2. Reload the VS Code window (`Cmd+R` or `Ctrl+R`)

For request or parsing failures, run **Codex Stats: Show Logs** from the Command Palette, or choose **Codex Stats** in **View → Output**. Logs include status, timing, response shape, and proxy host information, but redact token and proxy credentials.

## Privacy

This extension reads your local authentication file and sends an authenticated request only to ChatGPT's usage endpoint (or through your configured proxy). Diagnostic logs do not intentionally include access tokens, account IDs, email addresses, or proxy credentials.
