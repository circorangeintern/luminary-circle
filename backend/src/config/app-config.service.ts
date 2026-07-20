import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  get databaseUrl() {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get jwtSecret() {
    return this.config.get('JWT_SECRET', { infer: true });
  }

  get jwtExpiresIn() {
    return this.config.get('JWT_EXPIRES_IN', { infer: true });
  }

  get freshnessWindowDays() {
    return this.config.get('FRESHNESS_WINDOW_DAYS', { infer: true });
  }

  get flagMarkThreshold() {
    return this.config.get('FLAG_MARK_THRESHOLD', { infer: true });
  }

  get flagExcludeThreshold() {
    return this.config.get('FLAG_EXCLUDE_THRESHOLD', { infer: true });
  }

  get upstashRedisUrl() {
    return this.config.get('UPSTASH_REDIS_URL', { infer: true });
  }

  get isProduction() {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  get corsAllowedOrigins() {
    return this.config.get('CORS_ALLOWED_ORIGINS', { infer: true });
  }

  get corsAllowVercelPreviews() {
    return this.config.get('CORS_ALLOW_VERCEL_PREVIEWS', { infer: true });
  }
}
