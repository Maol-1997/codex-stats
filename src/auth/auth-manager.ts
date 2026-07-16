import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { AuthData } from '../types'
import { logger } from '../utils/logger'

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
    logger.warn('Could not parse Codex ID token', {
      error: error instanceof Error ? error.message : String(error),
    })
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
      logger.warn('Codex auth file does not exist', {
        codexHomeConfigured: !!process.env.CODEX_HOME,
      })
      return null
    }

    const authContent = fs.readFileSync(authPath, 'utf8')
    const authJson = JSON.parse(authContent)

    if (!authJson.tokens) {
      logger.warn('Codex auth file does not contain a tokens object')
      return null
    }

    if (!authJson.tokens.id_token || !authJson.tokens.access_token) {
      logger.warn('Codex auth file is missing required token fields', {
        idTokenPresent: !!authJson.tokens.id_token,
        accessTokenPresent: !!authJson.tokens.access_token,
      })
      return null
    }

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
    logger.error('Could not read Codex auth file', {
      error: error instanceof Error ? error.message : String(error),
      codexHomeConfigured: !!process.env.CODEX_HOME,
    })
    return null
  }
}
