import { RequestHandler } from "express";
import { supabase } from "../services/supabaseClient";

// Get a user's credits (with signup bonus if missing or zero)
export const getUserCredits: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("clerk_user_id", userId)
      .single();

    // Case 1: No record exists → create with 25 credits
    if (error && error.code === "PGRST116") {
      const { data: newRecord, error: insertError } = await supabase
        .from("user_credits")
        .insert({ clerk_user_id: userId, credits: 25 })
        .select("credits")
        .single();

      if (insertError) return res.status(500).json({ message: insertError.message });

      await supabase.from("credit_transactions").insert({
        clerk_user_id: userId,
        amount: 25,
        transaction_type: "signup_bonus",
        description: "Welcome bonus credits",
      });

      return res.json({ credits: newRecord?.credits ?? 25 });
    }

    if (error) return res.status(500).json({ message: error.message });

    // Case 2: Record exists but credits are 0 → retroactively grant free plan
    if (data && data.credits === 0) {
      const { data: updated, error: updateError } = await supabase
        .from("user_credits")
        .update({ credits: 25 })
        .eq("clerk_user_id", userId)
        .select("credits")
        .single();

      if (updateError) return res.status(500).json({ message: updateError.message });

      await supabase.from("credit_transactions").insert({
        clerk_user_id: userId,
        amount: 25,
        transaction_type: "signup_bonus",
        description: "Retroactive free plan",
      });

      return res.json({ credits: updated?.credits ?? 25 });
    }

    // Case 3: Record exists with credits > 0 → just return
    res.json({ credits: data?.credits ?? 0 });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Deduct credits from a user
export const deductCredits: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  try {
    const { data: current, error: fetchError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("clerk_user_id", userId)
      .single();

    if (fetchError) return res.status(500).json({ message: fetchError.message });
    if (!current || current.credits < amount) {
      return res.status(400).json({ message: "Not enough credits" });
    }

    const { data, error } = await supabase
      .from("user_credits")
      .update({ credits: current.credits - amount })
      .eq("clerk_user_id", userId)
      .select("credits")
      .single();

    if (error) return res.status(500).json({ message: error.message });

    await supabase.from("credit_transactions").insert({
      clerk_user_id: userId,
      amount: -amount,
      transaction_type: "usage",
      description: "Credit deduction",
    });

    res.json({ credits: data.credits });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
