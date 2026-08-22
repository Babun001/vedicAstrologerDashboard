"use client";
import { Wallet } from "lucide-react";
import { useEarnings } from "../context/EarningsContext";

const formatAmount = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

export const IncomeBadge = () => {
  const { combinedAmount, currency, loading } = useEarnings();

  return (
    <div
      title="Your total earnings from reports and answered questions"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 36,
        padding: "0 12px",
        borderRadius: 10,
        border: "1px solid var(--tan-border-soft)",
        background: "var(--cream-panel)",
        color: "var(--success)",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <Wallet size={14} />
      {loading
        ? "…"
        : `${currency === "INR" ? "₹" : currency + " "}${formatAmount(combinedAmount)}`}
    </div>
  );
};
