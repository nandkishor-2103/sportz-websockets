import { desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { createMatchSchema, listMatchesQuerySchema } from "../validations/matches.validation.js";


const MAX_LIMIT = 100;
export async function getMatches(req, res) {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if(!parsed.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: parsed.error.issues,
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.status(200).json({
        data,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to list matches.",
    });
  }
}

export async function createMatch(req, res) {
  const parsed = createMatchSchema.safeParse(req.body);

  if(!parsed.success) {
    return res.status(400).json({
      error: "Invalid Payload",
      details: parsed.error.issues,
    });
  }
  const { startTime, endTime, homeScore, awayScore } = parsed.data;


  try {
    const [event] = await db.insert(matches).values({
      ...parsed.data,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(startTime, endTime)
    }).returning();

    if(req.app.locals.broadcastMatchCreated) {
      req.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({ data: event });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: JSON.stringify(error)
    });
  }
}
