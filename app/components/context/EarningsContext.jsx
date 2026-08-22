"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axiosInstanceClient from "../services/client.services";

const EarningsContext = createContext(null);

export function EarningsProvider({ children }) {
  const [earnings, setEarnings] = useState({
    // Question-only lifetime total — kept under the original key names
    // for anything already relying on "amount"/"count" meaning
    // "from answered questions".
    amount: 0,
    count: 0,
    currency: "INR",
    perAnswerRate: 0,
    // Reports + questions combined — the real "total earnings" figure.
    combinedAmount: 0,
    combinedCount: 0,
    reportsAmount: 0,
    reportsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Both endpoints already exist and are fully built server-side —
  // this just wires the frontend to them. /earnings gives the lifetime
  // total (paid + unpaid, plus a combined reports+questions figure);
  // /answer-rate gives the astrologer's current per-question rate (what
  // a NOT-yet-answered question will pay).
  const refetch = useCallback(async () => {
    try {
      const [earningsRes, rateRes] = await Promise.all([
        axiosInstanceClient.get("/astrologer/earnings"),
        axiosInstanceClient.get("/astrologer/answer-rate"),
      ]);

      const lifetime = earningsRes.data?.data?.lifetime ?? {
        amount: 0,
        count: 0,
      };
      const combined = earningsRes.data?.data?.combined ?? lifetime;
      const reports = earningsRes.data?.data?.reports ?? { amount: 0, count: 0 };

      setEarnings({
        amount: lifetime.amount ?? 0,
        count: lifetime.count ?? 0,
        currency: earningsRes.data?.data?.currency ?? "INR",
        perAnswerRate: rateRes.data?.data?.perAnswerRate ?? 0,
        combinedAmount: combined.amount ?? 0,
        combinedCount: combined.count ?? 0,
        reportsAmount: reports.amount ?? 0,
        reportsCount: reports.count ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <EarningsContext.Provider value={{ ...earnings, loading, refetch }}>
      {children}
    </EarningsContext.Provider>
  );
}

export function useEarnings() {
  const ctx = useContext(EarningsContext);
  if (!ctx) {
    throw new Error(
      "useEarnings must be used inside <EarningsProvider>. Wrap your root layout with it.",
    );
  }
  return ctx;
}
