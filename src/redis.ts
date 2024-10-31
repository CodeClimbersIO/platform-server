import { createClient } from 'redis'

const REDIS_URL = Deno.env.get('REDIS_URL') || 'redis://localhost:6379'

export const redisClient = createClient({
  url: REDIS_URL,
})

await redisClient.connect()
