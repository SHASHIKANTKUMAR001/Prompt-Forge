import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [creditsAdded, setCreditsAdded] = useState(0);
  const { fetchCredits } = useCredits();

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();
        if (!data.success) {
          setStatus("error");
          return;
        }

        setCreditsAdded(data.creditsAdded || 0);
        setStatus("success");
        fetchCredits(); // refresh credits in header
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, fetchCredits]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-20 flex flex-col items-center text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Verifying your payment...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg mb-6">
              {creditsAdded} credits have been added to your account.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/projects">Start Generating Prompts</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't verify your payment. Please contact support.
            </p>
            <Button asChild>
              <Link to="/pricing">Back to Pricing</Link>
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
