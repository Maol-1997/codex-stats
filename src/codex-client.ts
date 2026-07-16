import axios, { AxiosProxyConfig } from 'axios'
import { AuthData, RateLimits, RateLimitWindow } from './types'
import { logger } from './utils/logger'

interface UsageWindow {
  used_percent?: unknown
  limit_window_seconds?: unknown
  reset_after_seconds?: unknown
  reset_at?: unknown
}

interface UsageResponse {
  rate_limit?: {
    primary_window?: UsageWindow
    secondary_window?: UsageWindow
  }
}

export class CodexAPIClient {
  private authData: AuthData
  private baseUrl: string = 'https://chatgpt.com/backend-api'
  private proxyUrl?: string

  constructor(authData: AuthData, proxyUrl?: string) {
    this.authData = authData
    this.proxyUrl = proxyUrl
  }

  setProxyUrl(proxyUrl?: string) {
    this.proxyUrl = proxyUrl
  }

  async getRateLimits(): Promise<RateLimits | null> {
    const url = `${this.baseUrl}/wham/usage`
    const startedAt = Date.now()
    const proxy = this.getProxyConfig()

    logger.info('Requesting Codex usage', {
      endpoint: '/backend-api/wham/usage',
      accountIdPresent: !!this.authData.accountId,
      proxyConfigured: !!this.proxyUrl,
    })

    try {
      const response = await axios.get<UsageResponse>(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.authData.accessToken}`,
          'User-Agent': 'codex-stats-vscode/1.0.3',
          ...(this.authData.accountId
            ? { 'chatgpt-account-id': this.authData.accountId }
            : {}),
        },
        proxy,
        timeout: 15000,
        validateStatus: () => true,
      })

      const durationMs = Date.now() - startedAt
      const contentType = response.headers['content-type']
      const requestId =
        response.headers['x-request-id'] || response.headers['cf-ray']

      logger.info('Codex usage response received', {
        status: response.status,
        durationMs,
        contentType,
        requestId,
      })

      if (response.status < 200 || response.status >= 300) {
        logger.warn('Codex usage request failed', {
          status: response.status,
          detail: this.getResponseDetail(response.data),
          responseKeys: this.getObjectKeys(response.data),
        })
        return null
      }

      const primary = this.parseWindow(
        response.data?.rate_limit?.primary_window,
      )
      const secondary = this.parseWindow(
        response.data?.rate_limit?.secondary_window,
      )

      if (!primary && !secondary) {
        logger.warn('Usage response did not contain a rate-limit window', {
          responseKeys: this.getObjectKeys(response.data),
          rateLimitKeys: this.getObjectKeys(response.data?.rate_limit),
        })
        return null
      }

      logger.info('Codex usage parsed', {
        primaryPresent: !!primary,
        secondaryPresent: !!secondary,
        primaryUsedPercent: primary?.used_percent,
        secondaryUsedPercent: secondary?.used_percent,
      })

      return { primary, secondary }
    } catch (error) {
      logger.error('Codex usage request threw an error', {
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
        code: axios.isAxiosError(error) ? error.code : undefined,
      })
      return null
    }
  }

  private parseWindow(window?: UsageWindow): RateLimitWindow | undefined {
    const usedPercent = this.toFiniteNumber(window?.used_percent)

    if (usedPercent === undefined) {
      return undefined
    }

    const windowSeconds = this.toFiniteNumber(window?.limit_window_seconds)
    const resetAfterSeconds = this.toFiniteNumber(
      window?.reset_after_seconds,
    )
    const resetAt = this.toFiniteNumber(window?.reset_at)
    const calculatedReset =
      resetAt === undefined
        ? undefined
        : Math.max(0, Math.round(resetAt - Date.now() / 1000))

    return {
      used_percent: usedPercent,
      window_minutes:
        windowSeconds === undefined ? undefined : windowSeconds / 60,
      resets_in_seconds: resetAfterSeconds ?? calculatedReset,
    }
  }

  private toFiniteNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  private getProxyConfig(): AxiosProxyConfig | false | undefined {
    if (!this.proxyUrl) {
      return undefined
    }

    try {
      const proxyUrl = new URL(this.proxyUrl)
      const protocol = proxyUrl.protocol.replace(':', '')

      if (protocol !== 'http' && protocol !== 'https') {
        logger.warn('Ignoring proxy with unsupported protocol', {
          protocol: proxyUrl.protocol,
        })
        return false
      }

      const proxy: AxiosProxyConfig = {
        protocol,
        host: proxyUrl.hostname,
        port: proxyUrl.port
          ? parseInt(proxyUrl.port, 10)
          : protocol === 'https'
            ? 443
            : 80,
      }

      if (proxyUrl.username || proxyUrl.password) {
        proxy.auth = {
          username: decodeURIComponent(proxyUrl.username),
          password: decodeURIComponent(proxyUrl.password),
        }
      }

      logger.info('Using configured proxy', {
        protocol,
        host: proxyUrl.hostname,
        port: proxy.port,
        authenticated: !!proxy.auth,
      })
      return proxy
    } catch (error) {
      logger.warn('Ignoring invalid proxy URL', {
        error: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  }

  private getObjectKeys(value: unknown): string[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return []
    }

    return Object.keys(value).slice(0, 20)
  }

  private getResponseDetail(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value.slice(0, 500)
    }

    if (!value || typeof value !== 'object') {
      return undefined
    }

    const body = value as Record<string, unknown>
    const detail = body.detail || body.message || body.error
    return typeof detail === 'string' ? detail.slice(0, 500) : undefined
  }
}
