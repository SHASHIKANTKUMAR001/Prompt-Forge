import { supabase } from "../services/supabaseClient";

export async function getAllProjects() {
  return await supabase.from("projects").select("*");
}

export async function getProjectById(id: string) {
  return await supabase.from("projects").select("*").eq("id", id).single();
}
