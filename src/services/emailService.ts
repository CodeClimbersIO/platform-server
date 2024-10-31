import axios, { AxiosError } from 'npm:axios'
import 'jsr:@std/dotenv/load'
import { assert } from 'jsr:@std/assert@1/assert'

const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY')
const LOOPS_API_URL = 'https://app.loops.so/api/v1/transactional'

/**
 * Sends an email using the Loops transactional email API
 * @param to Recipient's email address
 * @param transactionalId The ID of the transactional email template in Loops
 * @param data Dynamic data to be used in the email template
 */
export async function sendEmail<T>(
  to: string,
  transactionalId: string,
  data: T,
): Promise<void> {
  assert(LOOPS_API_KEY, 'LOOPS_API_KEY is not set')

  try {
    const response = await axios.post(
      LOOPS_API_URL,
      {
        transactionalId,
        email: to,
        dataVariables: data,
      },
      {
        headers: {
          Authorization: `Bearer ${LOOPS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.status === 200) {
      console.log(`Email sent successfully to ${to}`)
    } else {
      throw new Error(`Loops API returned status ${response.status}`)
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error sending email:', error.message)
    }

    throw new Error('Failed to send email')
  }
}

/**
 * Sends a weekly report email to a user
 */
export async function sendWeeklyReportEmail(
  email: string,
  data: Codeclimbers.WeeklyReportData,
): Promise<void> {
  // Assuming you have a transactional email template set up in Loops for the weekly report
  const WEEKLY_REPORT_TEMPLATE_ID = 'cm2eyuffe01nuu442jxc5vqcv'

  console.log('Sending weekly report email to', email)
  console.log('Weekly report data', data)

  const weeklyReportDto: Codeclimbers.WeeklyReportEmailDto = {
    totalScore: data.totalScore.actual,
    deepWorkAvgHours: Math.round(data.deepWorkTimeScore.actual / 60),
    totalCodingHours: Math.round(data.projectTimeScore.actual / 60),
    totalGrowthHours: Math.round(data.growthScore.actual / 60),
    totalActiveHours: Math.round(data.totalTimeScore.actual / 60),
  }
  await sendEmail<Codeclimbers.WeeklyReportEmailDto>(
    email,
    WEEKLY_REPORT_TEMPLATE_ID,
    weeklyReportDto,
  )
}

/**
 * Sends a weekly report email to a user
 */
export async function sendAIWeeklyReportEmail(
  email: string,
  performanceReview: string,
): Promise<void> {
  // Assuming you have a transactional email template set up in Loops for the weekly report
  const AI_WEEKLY_REPORT_TEMPLATE_ID = 'cm2f13gq80025wb5syk0i0v62'

  console.log('Sending weekly report email to', email)
  console.log('Weekly report data', performanceReview)
  const reviewWords = performanceReview.split(' ')
  const firstFortyWords = reviewWords.slice(0, 40).join(' ')
  const weeklyReportDto: Codeclimbers.AiWeeklyReportEmailDto = {
    firstFortyWords,
  }
  await sendEmail<Codeclimbers.AiWeeklyReportEmailDto>(
    email,
    AI_WEEKLY_REPORT_TEMPLATE_ID,
    weeklyReportDto,
  )
}
