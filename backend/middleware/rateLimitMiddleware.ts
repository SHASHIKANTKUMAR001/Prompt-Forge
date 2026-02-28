import { Request, Response, NextFunction } from "express";
import { supabase } from "../services/supabaseClient";
import { getRateLimitConfig } from "../models/rateLimitModel";
import { GeneratePromptBody } from "../types/requestTypes";

export async function rateLimit(
  req: Request<any, any, GeneratePromptBody>,
  res: Response,
  next: NextFunction
) {
  const { sessionId, promptType } = req.body;
  if (!sessionId || !promptType) {
    return res.status(400).json({ error: "Missing sessionId or promptType" });
  }

  // Fetch rate limit config
  const { data: config } = await getRateLimitConfig(promptType);
  const requestsPerMinute = config?.requests_per_minute ?? 10;
  const isEnabled = config?.is_enabled ?? true;

  if (!isEnabled) {
    return res.status(403).json({ error: "This prompt type is disabled." });
  }

  // Count requests in the last minute
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from("usage_stats")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("prompt_type", promptType)
    .gte("created_at", oneMinuteAgo);

  if (count && count >= requestsPerMinute) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      limit: requestsPerMinute,
      used: count,
    });
  }

  next();
}
