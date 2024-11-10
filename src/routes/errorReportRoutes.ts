import Router from '@koa/router'
import { assert } from 'jsr:@std/assert@1/assert'
import type { Context } from 'koa'

const router = new Router()

type ErrorReport = Record<string, unknown>

const sendErrorToDiscord = async (error: ErrorReport) => {
  const webhookUrl = Deno.env.get('DISCORD_ERROR_WEBHOOK')
  assert(webhookUrl, 'DISCORD_ERROR_WEBHOOK is not set')
  const email = error.userEmail || 'Unknown'

  const errorDescription = {
    error: error.error,
    email,
    errorStack: error.errorStack,
  }
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '**New Error Report Sent By User: ' + email +
          '**\nFull report: ',
        embeds: [
          {
            title: 'Error Details',
            description: '```' + JSON.stringify(errorDescription, null, 2) +
              '```',
            color: 15158332,
          },
        ],
      }),
    })
  } catch (err) {
    console.error('Error sending error to Discord:', err)
  }
}

router.post('/discord', async (ctx: Context) => {
  const error = ctx.request.body
  if (!error) {
    ctx.response.status = 400
    ctx.response.body = {
      error: 'error is required',
    }
  }
  await sendErrorToDiscord(error)
  ctx.response.status = 200
  ctx.response.body = {
    message: 'Error sent to Discord',
  }
})

export const errorReportRouter = router.prefix('/error-report')
