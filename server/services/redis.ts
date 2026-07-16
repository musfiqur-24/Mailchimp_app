import { Redis } from '@upstash/redis';

let client: Redis | undefined;

export function getRedis(): Redis {
  if (!client) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error('Redis environment variables are missing.');
    client = new Redis({ url, token });
  }
  return client;
}
