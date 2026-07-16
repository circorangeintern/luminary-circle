// scripts/verify-redis.ts — diagnostic version
import 'dotenv/config';
import Redis from 'ioredis';

const url = process.env.UPSTASH_REDIS_URL;

if (!url) {
  console.error('UPSTASH_REDIS_URL is not set in .env');
  process.exit(1);
}

// Show what we're actually connecting to (password masked)
console.log('Connecting to:', url.replace(/:\/\/(.*?):(.*?)@/, '://$1:****@'));
console.log('Protocol OK?  ', url.startsWith('rediss://') ? 'yes (TLS)' : `NO — starts with "${url.slice(0, 12)}..."`);

const redis = new Redis(url, {
  maxRetriesPerRequest: 1,
  connectTimeout: 10_000,
  retryStrategy: () => null, // fail fast, no retry loop
});

redis.on('connect', () => console.log('TCP socket connected'));
redis.on('ready', () => console.log('Redis handshake complete'));
redis.on('error', (e) => console.error('Underlying error:', e.message));

redis
  .ping()
  .then((res) => {
    console.log(`Redis says: ${res}`);
    return redis.quit();
  })
  .catch((e) => {
    console.error('PING failed:', e.message);
    process.exit(1);
  });