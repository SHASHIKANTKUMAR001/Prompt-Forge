import { supabase } from "../services/supabaseClient";

export async function logUsage(
  sessionId: string,
  projectId: string,
  promptType: string,
  tokens: number,
  cached: boolean
) {
  return await supabase.from("usage_stats").insert({
    session_id: sessionId,
    project_id: projectId,
    prompt_type: promptType,
    tokens_used: tokens,
    cached,
  });
}
