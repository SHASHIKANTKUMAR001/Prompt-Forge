import { RequestHandler } from "express";
import { stripe } from "../services/stripeClient";
import { supabase } from "../services/supabaseClient";

export const verifyPayment: RequestHandler = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ success: false });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    if (session.payment_status !== "paid") {
      return res.json({ success: false });
    }

    const clerkUserId = session.metadata?.clerkUserId;
    const planId = session.metadata?.planId;
    const creditsAdded = planId === "pro" ? 100 : planId === "enterprise" ? 500 : 0;

    // Confirm credits were already logged by webhook
    const { data } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (!data) {
      // fallback: insert if webhook missed
      await supabase.from("credit_transactions").insert({
        clerk_user_id: clerkUserId,
        amount: creditsAdded,
        transaction_type: "purchase",
        description: "Stripe Checkout purchase (manual verify)",
        stripe_session_id: session.id,
      });

      await supabase.from("user_credits").upsert(
        { clerk_user_id: clerkUserId, credits: creditsAdded },
        { onConflict: "clerk_user_id" }
      );
    }

    res.json({ success: true, creditsAdded });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
