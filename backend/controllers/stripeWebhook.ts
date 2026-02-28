import { RequestHandler } from "express";
import Stripe from "stripe";
import { stripe } from "../services/stripeClient";
import { supabase } from "../services/supabaseClient";

export const stripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId = session.metadata?.clerkUserId;
    const planId = session.metadata?.planId;

    if (clerkUserId && planId) {
      const creditsToAdd =
        planId === "pro" ? 100 : planId === "enterprise" ? 500 : 0;

      // Insert transaction
      await supabase.from("credit_transactions").insert({
        clerk_user_id: clerkUserId,
        amount: creditsToAdd,
        transaction_type: "purchase",
        description: "Stripe Checkout purchase",
        stripe_session_id: session.id,
      });

      // Upsert credits
      await supabase.from("user_credits").upsert(
        { clerk_user_id: clerkUserId, credits: creditsToAdd },
        { onConflict: "clerk_user_id" }
      );
    }
  }

  res.json({ received: true });
};
