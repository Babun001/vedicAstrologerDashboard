"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, HelpCircle, Clock, IndianRupee } from "lucide-react";
import axiosInstanceClient from "../services/client.services";
import { Eyebrow } from "../common/Eyebrow";
import { KanbanSkeleton } from "../common/Skeleton";
import {
  formatReportTask,
  formatQuestionCard,
  formatDuration,
  formatDateTime,
  formatMoney,
} from "../lib/workFormat";
import { RefreshButton } from "../common/RefreshButton";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "report", label: "Reports" },
  { key: "question", label: "Questions" },
];

// Rolling-window presets. "custom" isn't listed here — it's implied the
// moment the astrologer types into either date input (see
// handleFromChange/handleToChange below).
const RANGE_PRESETS = [
  { key: "all", label: "All time" },
  { key: "7d", label: "Last week" },
  { key: "30d", label: "Last month" },
  { key: "90d", label: "Last 3 months" },
  { key: "365d", label: "Last year" },
];

const PRESET_DAYS = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// Reports track real "processing segments" (see report.models.ts) so the
// first segment's startedAt is the true moment work began; fall back to
// assignedAt for a report that was somehow delivered with no segments.
const reportStart = (r) => r.processingSegments?.[0]?.startedAt || r.assignedAt;

// Questions don't keep a segment history, but firstStartedAt is stamped
// once (and never overwritten) the first time the astrologer moves the
// question to "processing" — see question.models.ts. Older
// already-answered questions from before that field existed fall back
// to assignedAt.
const questionStart = (q) => q.firstStartedAt || q.assignedAt;

export const HistoryView = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  // Date-range filter — either one of the rolling presets above, or
  // "custom" once the astrologer picks a from/to date directly.
  const [rangePreset, setRangePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const fetchHistory = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [reportsRes, questionsRes] = await Promise.all([
        axiosInstanceClient.get("/astrologer/reports"),
        axiosInstanceClient.get("/astrologer/questions"),
      ]);

      const deliveredReports = (reportsRes.data.data.board.delivered || [])
        .map(formatReportTask)
        .map((r) => ({
          kind: "report",
          id: r.id,
          client: r.client,
          planName: r.planName || r.service,
          startedAt: reportStart(r),
          endedAt: r.deliveredAt,
          durationSeconds: r.workDurationSeconds,
          amount: r.payoutRate,
          currency: r.payoutCurrency || "INR",
        }));

      const answeredQuestions = (questionsRes.data.data.board.answered || [])
        .map(formatQuestionCard)
        .map((q) => ({
          kind: "question",
          id: q.id,
          client: q.client,
          planName: q.planName || `Question #${q.sequence}`,
          startedAt: questionStart(q),
          endedAt: q.answeredAt,
          durationSeconds: q.workDurationSeconds,
          amount: q.payoutRate,
          currency: q.payoutCurrency || "INR",
        }));

      const merged = [...deliveredReports, ...answeredQuestions].sort(
        (a, b) => new Date(b.endedAt || 0) - new Date(a.endedAt || 0),
      );

      setItems(merged);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Live: a report/question delivered elsewhere (or by this astrologer
  // just now) shows up here without a manual refresh.
  useEffect(() => {
    const token = localStorage.getItem("astrologerToken");
    if (!token) return;

    const streamUrl = `${axiosInstanceClient.defaults.baseURL}/astrologer/stream?token=${token}`;
    const es = new EventSource(streamUrl);

    es.addEventListener("report-delivered", () => fetchHistory({ silent: true }));

    return () => es.close();
  }, []);

  const selectPreset = (key) => {
    setRangePreset(key);
    setCustomFrom("");
    setCustomTo("");
  };

  // Typing into either date input always means "I want a custom range" —
  // regardless of which preset button was active before.
  const handleFromChange = (e) => {
    setCustomFrom(e.target.value);
    setRangePreset("custom");
  };
  const handleToChange = (e) => {
    setCustomTo(e.target.value);
    setRangePreset("custom");
  };

  // Resolves the active preset/custom selection into actual start/end
  // Date bounds (or null for "no bound on this side").
  const rangeBounds = useMemo(() => {
    if (rangePreset === "custom") {
      return {
        start: customFrom ? startOfDay(new Date(`${customFrom}T00:00:00`)) : null,
        end: customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : null,
      };
    }
    if (rangePreset === "all" || !PRESET_DAYS[rangePreset]) {
      return { start: null, end: null };
    }
    const now = new Date();
    return {
      start: startOfDay(new Date(now.getTime() - PRESET_DAYS[rangePreset] * 86400000)),
      end: endOfDay(now),
    };
  }, [rangePreset, customFrom, customTo]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter !== "all" && i.kind !== filter) return false;
      if (rangeBounds.start && (!i.endedAt || new Date(i.endedAt) < rangeBounds.start)) {
        return false;
      }
      if (rangeBounds.end && (!i.endedAt || new Date(i.endedAt) > rangeBounds.end)) {
        return false;
      }
      return true;
    });
  }, [items, filter, rangeBounds]);

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, i) => sum + (i.amount || 0), 0),
    [filtered],
  );

  if (loading) {
    return (
      <>
        <Eyebrow>Completed work</Eyebrow>
        <KanbanSkeleton columnCount={1} />
      </>
    );
  }

  return (
    <>
      <Eyebrow>Completed work</Eyebrow>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`cr-btn ${filter === f.key ? "primary" : "secondary"}`}
              style={{ padding: "6px 14px", fontSize: 12 }}
            >
              {f.label}
            </button>
          ))}
          <RefreshButton
            onClick={() => fetchHistory({ silent: true })}
            loading={refreshing}
          />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--success)",
            background: "var(--cream-panel)",
            border: "1px solid var(--tan-border-soft)",
            borderRadius: 10,
            padding: "6px 12px",
          }}
        >
          <IndianRupee size={13} />
          {formatMoney(totalRevenue, "INR")} earned · {filtered.length} completed
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => selectPreset(p.key)}
            className={`cr-btn ${rangePreset === p.key ? "primary" : "secondary"}`}
            style={{ padding: "5px 12px", fontSize: 11.5 }}
          >
            {p.label}
          </button>
        ))}

        <span
          style={{
            width: 1,
            height: 18,
            background: "var(--tan-border-soft)",
            margin: "0 4px",
          }}
        />

        <label className="cr-date-field">
          From
          <input
            type="date"
            className="cr-date-input"
            value={customFrom}
            max={customTo || undefined}
            onChange={handleFromChange}
          />
        </label>

        <label className="cr-date-field">
          To
          <input
            type="date"
            className="cr-date-input"
            value={customTo}
            min={customFrom || undefined}
            onChange={handleToChange}
          />
        </label>

        {rangePreset === "custom" && (customFrom || customTo) && (
          <button
            onClick={() => selectPreset("all")}
            className="cr-btn secondary"
            style={{ padding: "5px 12px", fontSize: 11.5 }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="cr-card">
        {filtered.map((item) => (
          <div className="cr-history-row" key={`${item.kind}-${item.id}`}>
            <div className="cr-history-icon">
              {item.kind === "report" ? <FileText size={15} /> : <HelpCircle size={15} />}
            </div>

            <div className="cr-history-main">
              <div className="cr-history-top">
                <span className="cr-task-name">{item.client}</span>
                <span className="cr-history-plan">{item.planName || "—"}</span>
              </div>
              <div className="cr-history-meta">
                <span>
                  <Clock size={11} /> {formatDateTime(item.startedAt)} →{" "}
                  {formatDateTime(item.endedAt)}
                </span>
                <span>Time taken: {formatDuration(item.durationSeconds)}</span>
              </div>
            </div>

            <div className="cr-history-amount">
              {formatMoney(item.amount, item.currency)}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="cr-task-row">
            No completed {filter === "all" ? "work" : filter + "s"}
            {rangePreset !== "all" ? " in this date range" : ""} yet.
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryView;
