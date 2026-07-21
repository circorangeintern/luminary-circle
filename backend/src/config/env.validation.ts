import { formatError } from 'zod';
import { envSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(formatError(result.error));
    throw new Error('Environment validation failed. See errors above.');
  }
  return result.data;
}
