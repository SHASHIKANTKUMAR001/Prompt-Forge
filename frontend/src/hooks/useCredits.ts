import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL;

export function useCredits() {
  const { user, isSignedIn } = useUser();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!isSignedIn || !user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    if (!API_URL) {
      console.error("VITE_API_URL is not defined");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/credits/${user.id}`
      );

      if (!res.ok) {
        console.error("Failed to fetch credits:", res.status);
        setCredits(0);
        return;
      }

      const data = await res.json();
      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (err) {
      console.error("Error fetching credits:", err);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const deductCredit = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn || !user || credits === null || credits < 1) {
      return false;
    }

    if (!API_URL) {
      console.error("VITE_API_URL is not defined");
      return false;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/credits/${user.id}/deduct`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 1 }),
        }
      );

      if (!res.ok) {
        console.error("Failed to deduct credit:", res.status);
        return false;
      }

      const data = await res.json();
      setCredits(typeof data.credits === "number" ? data.credits : credits - 1);
      return true;
    } catch (err) {
      console.error("Error deducting credit:", err);
      return false;
    }
  }, [isSignedIn, user, credits]);

  return { credits, loading, fetchCredits, deductCredit };
}
