import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCredits } from "@/hooks/useCredits";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 25,
    icon: Zap,
    description: "Get started with prompt generation",
    features: [
      "25 credits on signup",
      "All prompt types",
      "Markdown export",
      "Community support",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    credits: 100,
    icon: Crown,
    description: "For serious builders and developers",
    features: [
      "100 credits",
      "All prompt types",
      "Markdown export",
      "Priority generation",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    credits: 500,
    icon: Rocket,
    description: "For teams and power users",
    features: [
      "500 credits",
      "All prompt types",
      "Markdown export",
      "Priority generation",
      "Dedicated support",
      "Custom prompt templates",
    ],
    popular: false,
  },
];

export default function Pricing() {
  const { user, isSignedIn } = useUser();
  const { credits } = useCredits();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePurchase = async (plan: typeof PLANS[0]) => {
    if (!isSignedIn || !user) {
      toast.error("Please sign in to purchase credits");
      navigate("/sign-in");
      return;
    }

    if (plan.id === "free") {
      toast.info("You already have the free plan!");
      return;
    }

    if (!API_URL) {
      toast.error("API URL not configured.");
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const res = await fetch(
        `${API_URL}/api/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkUserId: user.id,
            planId: plan.id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        toast.error("Failed to start checkout.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, <span className="text-primary">Credit-Based</span> Pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Buy credits to generate AI-powered prompts. Each prompt costs 1 credit.
            {isSignedIn && credits !== null && (
              <span className="block mt-2 text-primary font-medium">
                You currently have {credits} credits
              </span>
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0
                      ? "Free"
                      : `$${(plan.price / 100).toFixed(2)}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground ml-1">one-time</span>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.credits} credits
                  </p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "hero" : "default"}
                  size="lg"
                  onClick={() => handlePurchase(plan)}
                  disabled={loadingPlan === plan.id || plan.id === "free"}
                >
                  {loadingPlan === plan.id
                    ? "Loading..."
                    : plan.id === "free"
                    ? "Current Plan"
                    : `Buy ${plan.credits} Credits`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}