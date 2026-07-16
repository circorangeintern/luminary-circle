import { z } from 'zod';

export const envSchema = z.object({
  // App config
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database config
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),

  // JWT config
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),

  UPSTASH_REDIS_URL: z.url(),

  // Product config
  FRESHNESS_WINDOW_DAYS: z.coerce.number().int().positive().default(7),
  FLAG_MARK_THRESHOLD: z.coerce.number().int().positive().default(2),
  FLAG_EXCLUDE_THRESHOLD: z.coerce.number().int().positive().default(3),
});

export type EnvConfig = z.infer<typeof envSchema>;
