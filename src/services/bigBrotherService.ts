import { assert } from 'jsr:@std/assert@1/assert'
import Anthropic from 'npm:@anthropic-ai/sdk'
import { getGameSettings } from '../routes/gameMakerRoutes.ts'

const anthropicClient = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
})

/**
 * Takes the weekly repot which has a type WeeklyReportData and uses an llm prompt to generate a performance review that mimics a fictional boss.
 * Uses Claude 3.5 Sonnet
 */
export async function generatePerformanceReview(
  weeklyReport: Codeclimbers.WeeklyReportData,
): Promise<string> {
  assert(anthropicClient.apiKey, 'ANTHROPIC_API_KEY is not set')

  // convert actuals to hours
  const weeklyReportHours: Codeclimbers.WeeklyReportData = {
    deepWorkTimeScore: {
      ...weeklyReport.deepWorkTimeScore,
      actual: Math.round(weeklyReport.deepWorkTimeScore.actual / 60),
    },
    totalTimeScore: {
      ...weeklyReport.totalTimeScore,
      actual: Math.round(weeklyReport.totalTimeScore.actual / 60),
    },
    growthScore: {
      ...weeklyReport.growthScore,
      actual: Math.round(weeklyReport.growthScore.actual / 60),
    },
    projectTimeScore: {
      ...weeklyReport.projectTimeScore,
      actual: Math.round(weeklyReport.projectTimeScore.actual / 60),
    },
    socialMediaTimeScore: {
      ...weeklyReport.socialMediaTimeScore,
      actual: Math.round(weeklyReport.socialMediaTimeScore.actual / 60),
    },
    totalScore: {
      ...weeklyReport.totalScore,
      actual: weeklyReport.totalScore.actual,
    },
  }

  const prompt = await buildPromptFromWeeklyScores(weeklyReportHours)

  const message = await anthropicClient.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    model: 'claude-3-5-sonnet-20240620',
  })

  const response = message.content[0]
  switch (response.type) {
    case 'text':
      return response.text
    default:
      return 'invalid type'
  }
}

export const buildPromptFromWeeklyScores = async (
  weeklyReport: Codeclimbers.WeeklyReportData,
): Promise<string> => {
  const settings = await getGameSettings('ai-weekly-report')
  const prompt = settings.prompt
  return `
    ${prompt}
    ${JSON.stringify(weeklyReport)}
  `
}
