import express, {Request, Response} from "express";
import { sendWeeklyReportEmail } from "./emailService.ts";
import { redisClient } from "./redis.ts";

const app = express();
app.use(express.json());



app.get('/health', (_: Request, res: Response) => {
  return res.status(200).json({ok: true})
})

/**
 * Endpoint that takes a request from a codeclimbers user and sends out a transactional email. 
 * Each user receives just one per week. Records that the email was sent through Loops in a redis db
 * where the key is the email and start date for the week of the email
 */
app.post("/weekly-report", async (req: Request, res: Response) => {
  const { email, startOfWeek, weeklyReport } = req.body;

  if (!email || !startOfWeek || !weeklyReport) {
    return res.status(400).json({ error: "email, startOfWeek and weeklyReport is required" });
  }

  const key = `weekly-report:${email}:${startOfWeek}`;

  try {
    const emailSent = await redisClient.get(key);

    if (emailSent) {
      return res.status(429).json({ error: "Weekly report already sent for this user" });
    }

    // Send email (implement this function in emailService.ts)
    await sendWeeklyReportEmail(email, weeklyReport);

    // Record that the email was sent
    await redisClient.set(key, JSON.stringify(req.body));

    res.status(200).json({ message: "Weekly report sent successfully" });
  } catch (error) {
    console.error("Error processing weekly report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8000);
