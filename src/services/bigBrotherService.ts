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

  const prompt = await buildPromptFromWeeklyScores(weeklyReport)

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
