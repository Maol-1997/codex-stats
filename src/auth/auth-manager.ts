import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { AuthData } from '../types'

/**
 * Parse JWT token to extract payload
 */
function parseJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT')
    }
    const payload = Buffer.from(parts[1], 'base64url').toString()
    return JSON.parse(payload)
  } catch (error) {
    console.error('Error parsing JWT:', error)
    return {}
  }
}

/**
 * Load authentication data from Codex auth file
 */
export async function loadAuthData(): Promise<AuthData | null> {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex')
  const authPath = path.join(codexHome, 'auth.json')

  try {
    if (!fs.existsSync(authPath)) {
      return null
    }

    const authContent = fs.readFileSync(authPath, 'utf8')
    const authJson = JSON.parse(authContent)

    if (!authJson.tokens) {
      return null
    }

    // Parse ID token to get user info
    const idTokenPayload = parseJWT(authJson.tokens.id_token)

    return {
      idToken: authJson.tokens.id_token,
      accessToken: authJson.tokens.access_token,
      refreshToken: authJson.tokens.refresh_token,
      accountId: authJson.tokens.account_id,
      email: idTokenPayload.email || 'Unknown',
      planType:
        idTokenPayload['https://api.openai.com/auth']?.chatgpt_plan_type ||
        'Unknown',
    }
  } catch (error) {
    console.error('Error reading auth file:', error)
    return null
  }
}
