import { z } from 'zod';

export const envSchema = z.object({
  // App config
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Cors config
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  CORS_ALLOW_VERCEL_PREVIEWS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // Database config
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),

  // JWT config
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(
      /^\d+(s|m|h|d)$/,
      'JWT_EXPIRES_IN must be like 30m, 12h, 1d, or 604800s',
    )
    .default('1d'),

  // Redis config
  UPSTASH_REDIS_URL: z.url(),

  // Redis rate limiting config
  PRICE_SUBMIT_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(10),
  PRICE_SUBMIT_LIMIT_PER_MARKET_PER_HOUR: z.coerce
    .number()
    .int()
    .positive()
    .default(5),

  // Product config
  FRESHNESS_WINDOW_DAYS: z.coerce.number().int().positive().default(7),
  FLAG_MARK_THRESHOLD: z.coerce.number().int().positive().default(2),
  FLAG_EXCLUDE_THRESHOLD: z.coerce.number().int().positive().default(3),
});

export type EnvConfig = z.infer<typeof envSchema>;
