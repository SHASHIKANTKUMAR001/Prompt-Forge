import { supabase } from "../services/supabaseClient";

export async function getRateLimitConfig(promptType: string) {
  return await supabase
    .from("rate_limit_config")
    .select("*")
    .eq("prompt_type", promptType)
    .single();
}
