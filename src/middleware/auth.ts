import { assert } from 'jsr:@std/assert@1/assert'
import type { Context } from 'koa'
const GAME_MAKER_API_KEY = Deno.env.get('GAME_MAKER_API_KEY')
// middleware to check for api key in header
export const gameMakerApiKeyMiddleware = async (
  ctx: Context,
  next: () => Promise<unknown>,
) => {
  assert(GAME_MAKER_API_KEY, 'GAME_MAKER_API_KEY is not set')
  const apiKey = ctx.get('x-game-maker-api-key')
  if (apiKey !== GAME_MAKER_API_KEY) {
    ctx.response.status = 401
    ctx.response.body = { error: 'Unauthorized' }
    return
  }
  await next()
}
