/**
 * Controller and service that is in charge of managing the settings for the platform games like the ai weekly report
 * Settings right now just include the prompt for the ai weekly report and the test weekly scores to use when generating the performance review
 * The settings are stored in redis
 */

import { redisClient } from '../redis.ts'
import { gameMakerApiKeyMiddleware } from '../middleware/auth.ts'
import Router from '@koa/router'
import type { Context } from 'koa'
import { generatePerformanceReview } from '../services/bigBrotherService.ts'

export const getGameSettings = async (game: string) => {
  const key = `game-settings:${game}`
  const settings = await redisClient.get(key)

  if (!settings) {
    throw new Error(`Game settings not found for ${game}`)
  }

  return JSON.parse(settings)
}

export const setGameSettings = async (game: string, settings: string) => {
  const key = `game-settings:${game}`
  await redisClient.set(key, settings)
}

export const getAiReports = async () => {
  const key = `game-maker-weekly-reports`
  const reportsString = await redisClient.get(key)
  return reportsString ? JSON.parse(reportsString) : []
}

export const setAiReports = async (
  newReport: { email: string; startOfWeek: string; performanceReview: string },
) => {
  const key = `game-maker-weekly-reports`
  const reportsString = await redisClient.get(key)
  let reports = []
  if (reportsString) {
    reports = JSON.parse(reportsString)
  }
  reports.push(newReport)
  await redisClient.set(key, JSON.stringify(reports))
}

const router = new Router()

router.get(
  '/game-maker/settings/:game',
  gameMakerApiKeyMiddleware,
  async (ctx: Context) => {
    const game = ctx.params.game
    const settings = await getGameSettings(game)
    ctx.response.body = { data: settings }
    // ctx.response.body = { message: "Game settings retrieved" };
  },
)

router.post(
  '/game-maker/settings/:game',
  gameMakerApiKeyMiddleware,
  async (ctx: Context) => {
    const game = ctx.params.game
    const settings = await ctx.request.body
    await setGameSettings(game, JSON.stringify(settings))
    ctx.response.body = { message: 'Game settings updated' }
  },
)

// runs the weekly report and saves it to a list in redis (key: game-maker-weekly-reports)
router.post(
  '/game-maker/ai-weekly-reports',
  gameMakerApiKeyMiddleware,
  async (ctx: Context) => {
    const { email, startOfWeek, weeklyReport } = await ctx.request.body

    const performanceReview = await generatePerformanceReview(weeklyReport)

    await setAiReports({ email, startOfWeek, performanceReview })

    ctx.response.body = { message: 'Weekly report saved' }
  },
)

//endpoint returns the list of weekly reports
router.get(
  '/game-maker/ai-weekly-reports',
  gameMakerApiKeyMiddleware,
  async (ctx: Context) => {
    const reports = await getAiReports()
    ctx.response.body = { data: reports }
  },
)

export const gameMakerRouter = router
