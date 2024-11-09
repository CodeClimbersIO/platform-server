import Router from '@koa/router'
import { assert } from 'jsr:@std/assert@1/assert'
import type { Context } from 'koa'

const router = new Router()

type ErrorReport = Record<string, unknown>

const sendErrorToDiscord = async (error: ErrorReport) => {
  const webhookUrl = Deno.env.get('DISCORD_ERROR_WEBHOOK')
  assert(webhookUrl, 'DISCORD_ERROR_WEBHOOK is not set')

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '**New Error Report**',
      embeds: [
        {
          title: 'Error Details',
          description: '```' + JSON.stringify(error, null, 2) + '```',
          color: 15158332, // Red color
        },
      ],
    }),
  })
}

router.post('/discord', async (ctx: Context) => {
  const { error } = ctx.request.body

  if (!error) {
    ctx.response.status = 400
    ctx.response.body = {
      error: 'error is required',
    }
  }

  await sendErrorToDiscord(error)
})

export const errorReportRouter = router
