"use client";

import { RefreshCw } from "lucide-react";

// Manual "reload this page's data" button. Every board here also
// listens for live SSE events, but SSE connections can silently drop
// (phone locks, wifi blips, tab backgrounded for a while) without the
// UI knowing — this gives the astrologer a way to force a fresh fetch
// instead of wondering whether a newly-assigned task is just not
// showing up yet.
export const RefreshButton = ({ onClick, loading, label = "Refresh" }) => (
  <button
    type="button"
    className="cr-refresh-btn"
    onClick={onClick}
    disabled={loading}
    title="Reload — in case a new assignment didn't show up live"
  >
    <RefreshCw size={13} className={loading ? "cr-spin" : ""} />
    {label}
  </button>
);
