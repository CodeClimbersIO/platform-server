import type { Context } from '@oak/oak/context'

export async function errorHandler(
  context: Context,
  next: () => Promise<unknown>,
) {
  try {
    await next()
  } catch (err: unknown) {
    console.error('Unhandled Error:', err)

    context.response.status = 500
    context.response.body = {
      error: 'An unexpected error occurred.',
    }
  }
}
