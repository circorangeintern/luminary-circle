import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { AppException } from '../common/errors/app.exception';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 5000;

interface SiteVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private readonly config: AppConfigService) {}

  /**
   * Verifies a Turnstile token with Cloudflare, server side.
   *
   * Fails CLOSED: if Cloudflare is unreachable or slow, registration is
   * rejected rather than allowed through. A gate that opens when its guard
   * is unavailable is not a gate. (Decision of record, captcha plan 4.2.)
   */
  async verify(token: string, remoteIp?: string): Promise<void> {
    const body = new URLSearchParams({
      secret: this.config.turnstileSecretKey,
      response: token,
    });
    // Optional, but it lets Cloudflare factor the caller's IP into its
    // assessment and detect tokens being replayed from elsewhere.
    if (remoteIp) body.append('remoteip', remoteIp);

    let result: SiteVerifyResponse;

    try {
      const res = await fetch(SITEVERIFY_URL, {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      });

      if (!res.ok) {
        throw new Error(`siteverify returned HTTP ${res.status}`);
      }

      result = (await res.json()) as SiteVerifyResponse;
    } catch (e) {
      // Network failure, timeout, or malformed response. Fail closed.
      this.logger.error(
        `Turnstile verification unavailable: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw new AppException(
        'CAPTCHA_FAILED',
        'We could not verify your request right now. Please try again in a moment.',
        [{ field: 'captchaToken', message: 'Verification service unavailable' }],
      );
    }

    if (!result.success) {
      // Log the codes for debugging, but never leak them to the client:
      // they tell an attacker exactly why their forgery was rejected.
      this.logger.warn(
        `Turnstile rejected a token: ${(result['error-codes'] ?? []).join(', ')}`,
      );
      throw new AppException(
        'CAPTCHA_FAILED',
        "We couldn't verify that you're human. Please try again.",
        [{ field: 'captchaToken', message: 'Verification failed' }],
      );
    }
  }
}