"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronRight, FileText, HelpCircle } from "lucide-react";
import { StatusPill } from "../common/StatusPill";
import { Eyebrow } from "../common/Eyebrow";
import axiosInstanceClient from "../services/client.services";
import { MyWorkSkeleton } from "../common/Skeleton";
import { useNotifications } from "../context/NotificationContext";
import {
  formatReportTask,
  formatQuestionCard,
  formatMoney,
} from "../lib/workFormat";
import { RefreshButton } from "../common/RefreshButton";
import { useEarnings } from "../context/EarningsContext";

const Stat = ({ label, value, sub, tone }) => (
  <div className="cr-card cr-stat">
    <div className="cr-stat-label">{label}</div>

    <div
      className="cr-stat-value"
      style={tone === "success" ? { color: "var(--success)" } : {}}
    >
      {value}
    </div>

    <div className="cr-stat-sub">{sub}</div>
  </div>
);

export const MyWorkView = ({
  onViewTasks,
  onSelectReport,
  onSelectQuestion,
}) => {
  const { combinedAmount, currency } = useEarnings();

  const formatAmount = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workStats, setWorkStats] = useState({
    assigned: 0,
    delivered: 0,
    due: 0,
    capacity: { used: 0, limit: 0 },
    deliveredToday: 0,
    rating: { avg: 0, total: 0 },
    questions: {
      assigned: 0,
      due: 0,
      capacity: { used: 0, limit: 0 },
      answeredToday: 0,
    },
    earnings: { currency: "INR", totalAmount: 0, totalCount: 0 },
  });

  const [reportItems, setReportItems] = useState([]);
  const [questionItems, setQuestionItems] = useState([]);
  const { addNotification } = useNotifications();
  const prevActiveRef = useRef(null);

  const fetchWork = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [workResponse, reportsResponse, questionsResponse] =
        await Promise.all([
          axiosInstanceClient.get("/astrologer/my-work"),
          axiosInstanceClient.get("/astrologer/reports"),
          axiosInstanceClient.get("/astrologer/questions"),
        ]);

      const newStats = workResponse.data.data;
      setWorkStats(newStats);

      const activeToday = newStats.capacity?.used ?? 0;
      const activeQuestionsToday = newStats.questions?.capacity?.used ?? 0;
      if (
        prevActiveRef.current !== null &&
        prevActiveRef.current > 0 &&
        activeToday === 0 &&
        activeQuestionsToday === 0
      ) {
        addNotification(
          "milestone",
          "All caught up!",
          "You've completed all of today's assigned tasks. 🎉",
        );
      }
      prevActiveRef.current = activeToday + activeQuestionsToday;

      const reportBoard = reportsResponse.data.data.board;
      const notDeliveredReports = [
        ...reportBoard.pending,
        ...reportBoard.processing,
        ...reportBoard.completed,
      ];
      setReportItems(notDeliveredReports.map(formatReportTask));

      const questionBoard = questionsResponse.data.data.board;
      const notAnsweredQuestions = [
        ...questionBoard.pending,
        ...questionBoard.processing,
      ];
      setQuestionItems(notAnsweredQuestions.map(formatQuestionCard));
    } catch (error) {
      console.error("Failed to fetch astrologer work:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("astrologerToken");
    if (!token) return;

    const streamUrl = `${axiosInstanceClient.defaults.baseURL}/astrologer/stream?token=${token}`;
    const es = new EventSource(streamUrl);

    es.addEventListener("new-task-assigned", () => {
      fetchWork({ silent: true });
    });

    es.addEventListener("new-question-assigned", () => {
      fetchWork({ silent: true });
    });

    es.addEventListener("report-delivered", () => {
      fetchWork({ silent: true });
    });

    return () => es.close();
  }, []);

  if (loading) {
    return (
      <>
        <Eyebrow>Today</Eyebrow>
        <MyWorkSkeleton />
      </>
    );
  }

  const rejectedTasks = reportItems.filter(
    (t) => t.adminReview?.status === "rejected",
  );

  // Merge reports + questions into one "assigned to you" feed, most
  // urgent (nearest due date, no due date last) first.
  const merged = [
    ...reportItems.map((t) => ({ ...t, kind: "report" })),
    ...questionItems.map((q) => ({ ...q, kind: "question" })),
  ].sort((a, b) => {
    const aTime = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
    const bTime = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
    return aTime - bTime;
  });

  const q = workStats.questions || {};
  const earnings = workStats.earnings || { currency: "INR", totalAmount: 0 };

  return (
    <>
      <div className="cr-page-head-row">
        <Eyebrow>Today</Eyebrow>
        <RefreshButton
          onClick={() => fetchWork({ silent: true })}
          loading={refreshing}
        />
      </div>

      {rejectedTasks.length > 0 && (
        <div
          className="cr-card"
          style={{
            marginBottom: 18,
            padding: "14px 16px",
            background: "rgba(176,58,46,0.06)",
            border: "1px solid rgba(176,58,46,0.3)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "#b03a2e",
              marginBottom: 8,
            }}
          >
            ⚠ {rejectedTasks.length} report
            {rejectedTasks.length === 1 ? "" : "s"} sent back for revision
          </div>
          {rejectedTasks.map((t) => (
            <div
              key={t.id}
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>
                <strong>{t.client}</strong>
                {t.adminReview?.reviewNote
                  ? ` — ${t.adminReview.reviewNote}`
                  : ""}
              </span>
              <button
                onClick={() =>
                  onSelectReport ? onSelectReport(t) : onViewTasks()
                }
                style={{
                  fontSize: 11,
                  color: "#b03a2e",
                  background: "none",
                  border: "1px solid rgba(176,58,46,0.4)",
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Review →
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cr-stat-grid">
        <Stat
          label="Assigned today"
          value={workStats.assigned}
          sub="Reports assigned"
        />

        <Stat
          label="Reports delivered"
          value={`${workStats.deliveredToday ?? 0} / ${workStats.capacity?.limit ?? 0}`}
          sub="Delivered today"
          tone="success"
        />

        <Stat
          label="Questions delivery"
          value={`${q.answeredToday ?? 0} / ${q.capacity?.limit ?? 0}`}
          sub="Answered today"
          tone="success"
        />

        <Stat
          label="Overdue"
          value={workStats.due + (q.due ?? 0)}
          sub="Pending deadlines"
          tone="success"
        />

        <Stat
          label="Today's capacity"
          value={`${workStats.capacity?.used ?? 0} / ${workStats.capacity?.limit ?? 0}`}
          sub="Active tasks vs. daily limit"
        />

        <Stat
          label="Total earning"
          value={
            loading
              ? "…"
              : `${currency === "INR" ? "₹" : currency + " "}${formatAmount(combinedAmount)}`
          }
          sub="Reports + questions, lifetime"
          tone="success"
        />

        <Stat
          label="Your rating"
          value={
            workStats.rating?.total > 0
              ? `${workStats.rating.avg.toFixed(1)} ★`
              : "—"
          }
          sub={
            workStats.rating?.total > 0
              ? `${workStats.rating.total} review${workStats.rating.total === 1 ? "" : "s"}`
              : "No ratings yet"
          }
        />
      </div>

      <div className="cr-card" style={{ marginBottom: 18 }}>
        <div style={{ padding: "14px 16px 4px" }}>
          <div className="cr-section-title">
            Assigned to you{" "}
            <span className="cr-section-count">{merged.length}</span>
          </div>
        </div>

        <div>
          {merged.map((item) => (
            <div
              className="cr-task-row"
              key={`${item.kind}-${item.id}`}
              onClick={() =>
                item.kind === "report"
                  ? onSelectReport
                    ? onSelectReport(item)
                    : onViewTasks()
                  : onSelectQuestion?.(item)
              }
            >
              <StatusPill status={item.status} />

              {item.kind === "report" ? (
                <FileText size={14} color="var(--text-faint)" />
              ) : (
                <HelpCircle size={14} color="var(--text-faint)" />
              )}

              <div style={{ flex: 1 }}>
                <div className="cr-task-name">
                  {item.client}
                  {item.adminReview?.status === "rejected" && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        color: "#b03a2e",
                        fontWeight: 700,
                      }}
                    >
                      ⚠ REVISION
                    </span>
                  )}
                </div>
                <div className="cr-task-meta">
                  {item.kind === "report"
                    ? item.service || "Report"
                    : `Question #${item.sequence}${item.concern ? ` · ${item.concern}` : ""}`}
                  {" • Due "}
                  {item.dueAt ? new Date(item.dueAt).toLocaleDateString() : "-"}
                </div>
              </div>

              <ChevronRight size={15} color="var(--text-faint)" />
            </div>
          ))}

          {merged.length === 0 && (
            <div className="cr-task-row">No assigned reports or questions</div>
          )}
        </div>
      </div>
    </>
  );
};
