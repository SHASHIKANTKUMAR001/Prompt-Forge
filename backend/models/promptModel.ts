import { supabase } from "../services/supabaseClient";

export async function getCachedPrompt(projectId: string, promptType: string) {
  return await supabase
    .from("prompt_cache")
    .select("*")
    .eq("project_id", projectId)
    .eq("prompt_type", promptType)
    .gt("expires_at", new Date().toISOString())
    .single();
}

export async function cachePrompt(
  projectId: string,
  promptType: string,
  content: string,
  tokenEstimate: number,
  ttlHours: number
) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  return await supabase
    .from("prompt_cache")
    .upsert({
      project_id: projectId,
      prompt_type: promptType,
      prompt_content: content,
      token_estimate: tokenEstimate,
      expires_at: expiresAt,
    }, { onConflict: "project_id,prompt_type" })
    .select()
    .single();
}
