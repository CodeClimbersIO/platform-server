import { redisClient } from '../redis.ts'
import { Router } from '@oak/oak/router'
import { generatePerformanceReview } from '../services/bigBrotherService.ts'
import {
  sendAIWeeklyReportEmail,
  sendWeeklyReportEmail,
} from '../services/emailService.ts'
import type { Context } from '@oak/oak/context'
import { validateStartOfWeek } from '../validators/date.validator.ts'

const deprecratedRouter = new Router()
const router = new Router()

const weeklyReportHandler = async (ctx: Context) => {
  const { email, startOfWeek, weeklyReport } = await ctx.request.body.json()

  if (!email || !startOfWeek || !weeklyReport) {
    ctx.response.status = 400
    ctx.response.body = {
      error: 'email, startOfWeek and weeklyReport is required',
    }
    return
  }
  const invalidWeek = validateStartOfWeek(startOfWeek)
  if (invalidWeek) {
    ctx.response.status = invalidWeek.status
    ctx.response.body = invalidWeek.body
    return
  }
  const key = `weekly-report:${email}:${startOfWeek}`

  try {
    const emailSent = await redisClient.get(key)
    if (emailSent) {
      ctx.response.status = 429
      ctx.response.body = { error: 'Weekly report already sent for this user' }
      return
    }

    // Send email (implement this function in emailService.ts)
    await sendWeeklyReportEmail(email, weeklyReport)

    // Record that the email was sent
    await redisClient.set(key, JSON.stringify(ctx.request.body))

    ctx.response.body = { message: 'Weekly report sent successfully' }
  } catch (error) {
    console.error('Error processing weekly report:', error)
    ctx.response.status = 500
    ctx.response.body = { error: 'Internal server error' }
  }
}
/**
 * Endpoint that takes a request from a codeclimbers user and sends out a transactional email.
 * Each user receives just one per week. Records that the email was sent through Loops in a redis db
 * where the key is the email and start date for the week of the email
 */
router.post('/weekly-report', weeklyReportHandler)
deprecratedRouter.post('/weekly-report', weeklyReportHandler)

/**
 * Endpoint that takes a request from a codeclimbers user and sends out a transactional email with a performance review generated by an llm.
 * Each user receives just one per week. Records the performance review in a redis db
 * where the key is the email and start date for the week of the email
 */
router.post('/ai-weekly-report', async (ctx) => {
  const { email, startOfWeek, weeklyReport } = await ctx.request.body.json()

  if (!email || !startOfWeek || !weeklyReport) {
    ctx.response.status = 400
    ctx.response.body = {
      error: 'email, startOfWeek and weeklyReport is required',
    }
  }
  const invalidWeek = validateStartOfWeek(startOfWeek)
  if (invalidWeek) {
    ctx.response.status = invalidWeek.status
    ctx.response.body = invalidWeek.body
    return
  }
  const key = `ai-weekly-report:${email}:${startOfWeek}`

  try {
    const emailSent = await redisClient.get(key)
    if (emailSent) {
      ctx.response.status = 429
      ctx.response.body = {
        error: 'AI weekly report already sent for this user',
      }
      return
    }

    const performanceReview = await generatePerformanceReview(weeklyReport)
    // Send email (implement this function in emailService.ts)
    await sendAIWeeklyReportEmail(email, performanceReview)

    // Record that the email was sent
    await redisClient.set(key, performanceReview)

    ctx.response.body = { message: 'AI Weekly report sent successfully' }
  } catch (error) {
    console.error('Error processing weekly report:', error)
    ctx.response.status = 500
    ctx.response.body = { error: 'Internal server error' }
  }
})

/**
 * Endpoint that retrieves the performance review for a user using their email and start date of the week
 */
router.get('/ai-weekly-report', async (ctx) => {
  const email = ctx.request.url.searchParams.get('email')
  const startOfWeek = ctx.request.url.searchParams.get('startOfWeek')
  if (!email || !startOfWeek) {
    ctx.response.status = 400
    ctx.response.body = { error: 'email and startOfWeek are required' }
    return
  }
  const invalidWeek = validateStartOfWeek(startOfWeek)
  if (invalidWeek) {
    ctx.response.status = invalidWeek.status
    ctx.response.body = invalidWeek.body
    return
  }
  // ensure startOfWeek is after 10-01-2024 and before today

  const key = `ai-weekly-report:${email}:${startOfWeek}`
  console.log(key)
  const performanceReview = await redisClient.get(key)
  console.log(performanceReview)
  ctx.response.body = { data: performanceReview }
})

export const deprecratedWeeklyReportRouter = deprecratedRouter
export const weeklyReportRouter = router
