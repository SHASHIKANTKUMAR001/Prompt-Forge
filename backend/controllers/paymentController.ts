import { RequestHandler } from "express";
import { stripe } from "../services/stripeClient";
import { supabase } from "../services/supabaseClient"; // your Supabase client

const PLANS: Record<string, { credits: number; amount: number }> = {
  pro: { credits: 100, amount: 999 },
  enterprise: { credits: 500, amount: 4999 },
};

export const createCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const { clerkUserId, planId } = req.body;
    const origin = req.headers.origin as string;

    const plan = PLANS[planId];
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${plan.credits} Credits` },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { clerkUserId, planId },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
