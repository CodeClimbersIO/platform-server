declare namespace Codeclimbers {
  export interface WeeklyScore {
    rating: string
    score: number
    actual: number
  }

  export interface WeeklyReportData {
    deepWorkTimeScore: WeeklyScore
    totalTimeScore: WeeklyScore
    growthScore: WeeklyScore
    projectTimeScore: WeeklyScore
    socialMediaTimeScore: WeeklyScore
    totalScore: WeeklyScore
  }

  export interface WeeklyReportEmailDto {
    totalScore: number
    deepWorkAvgHours: number
    totalCodingHours: number
    totalGrowthHours: number
    totalActiveHours: number
  }

  export interface AiWeeklyReportEmailDto {
    firstFortyWords: string
  }
}
