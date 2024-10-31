import dayjs from 'dayjs'

export const validateStartOfWeek = (
  startOfWeek: string,
): { status: number; body: { error: string } } | undefined => {
  // validate startOfWeek is a valid date
  const date = dayjs(startOfWeek)
  console.log(date)
  if (!date.isValid()) {
    return { status: 400, body: { error: 'startOfWeek is not a valid date' } }
  }

  // Check if date is in the future
  const today = dayjs()
  if (date.isAfter(today)) {
    return {
      status: 400,
      body: { error: 'startOfWeek cannot be a future date' },
    }
  }

  // Check if date is more than 1 month ago
  const oneMonthAgo = dayjs().subtract(1, 'month')
  if (date.isBefore(oneMonthAgo)) {
    return {
      status: 400,
      body: { error: 'startOfWeek cannot be more than 1 month ago' },
    }
  }

  // Check if date is a Monday (0 = Sunday, 1 = Monday, etc.)
  console.log(date.day())
  if (date.day() !== 1) {
    return { status: 400, body: { error: 'startOfWeek must be a Monday' } }
  }
}