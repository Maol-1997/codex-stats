# Installation Instructions

## Quick Install

1. **Install dependencies:**
   ```bash
   cd codex-usage
   npm install
   ```

2. **Compile the extension:**
   ```bash
   npm run compile
   ```

3. **Test in VS Code:**
   - Open the `codex-usage` folder in VS Code
   - Press `F5` to launch a new VS Code window with the extension loaded
   - You should see the Codex usage indicator in the status bar (bottom right)

## Building for Distribution

1. **Install vsce (Visual Studio Code Extension manager):**
   ```bash
   npm install -g vsce
   ```

2. **Package the extension:**
   ```bash
   cd codex-usage
   vsce package
   ```
   This will create a `codex-usage-1.0.0.vsix` file

3. **Install the extension in VS Code:**
   - Open VS Code
   - Go to Extensions view (`Cmd+Shift+X` or `Ctrl+Shift+X`)
   - Click on the `...` menu at the top of the Extensions view
   - Select "Install from VSIX..."
   - Select the `codex-usage-1.0.0.vsix` file

## First Time Setup

1. **Make sure you're logged in to Codex:**
   ```bash
   codex login
   ```

2. **Reload VS Code window:**
   - Press `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
   - Or use Command Palette: "Developer: Reload Window"

3. **Check the status bar:**
   - You should see a percentage indicator (e.g., "✓ 0%")
   - Hover over it to see detailed information
   - Click it to manually refresh

## Troubleshooting

**"Need to login" message:**
- Run `codex login` in terminal
- Make sure `~/.codex/auth.json` exists
- Reload VS Code window

**No status bar item visible:**
- Check the Output panel (`View > Output`)
- Select "Codex Usage Monitor" from the dropdown
- Look for any error messages

**Rate limits not updating:**
- Click the status bar item to force refresh
- Check your internet connection
- Verify your auth token hasn't expired
