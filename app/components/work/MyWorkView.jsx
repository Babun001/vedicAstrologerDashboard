"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { StatusPill } from "../common/StatusPill";
import { Eyebrow } from "../common/Eyebrow";
import axiosInstanceClient from "../services/client.services";
import { STATUS_FROM_BACKEND } from "../data/statusMap";
import { MyWorkSkeleton } from "../common/Skeleton";
import { useNotifications } from "../context/NotificationContext";

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

export const MyWorkView = ({ onViewTasks }) => {
  const [loading, setLoading] = useState(true);
  const [workStats, setWorkStats] = useState({
    assigned: 0,
    delivered: 0,
    due: 0,
    capacity: { used: 0, limit: 0 },
    deliveredToday: 0,
    rating: { avg: 0, total: 0 },
  });

  const [tasks, setTasks] = useState([]);
  const { addNotification } = useNotifications();

  const fetchWork = async () => {
    try {
      setLoading(true);

      const [workResponse, reportsResponse] = await Promise.all([
        axiosInstanceClient.get("/astrologer/my-work"),
        axiosInstanceClient.get("/astrologer/reports"),
      ]);

      const newStats = workResponse.data.data;
      setWorkStats(newStats);

      const activeToday = newStats.capacity?.used ?? 0;
      if (
        prevActiveRef.current !== null &&
        prevActiveRef.current > 0 &&
        activeToday === 0
      ) {
        addNotification(
          "milestone",
          "All caught up!",
          "You've completed all of today's assigned tasks. 🎉",
        );
      }
      prevActiveRef.current = activeToday;

      const board = reportsResponse.data.data.board;
      const flattenedReports = [
        ...board.pending,
        ...board.processing,
        ...board.completed,
        ...board.delivered,
      ];

      setTasks(flattenedReports);
    } catch (error) {
      console.error("Failed to fetch astrologer work:", error);
    } finally {
      setLoading(false);
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
      fetchWork();
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

  const rejectedTasks = tasks.filter(
    (t) => t.adminReview?.status === "rejected",
  );

  return (
    <>
      <Eyebrow>Today</Eyebrow>

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
              key={t._id}
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
                <strong>{t.leadId?.fullName || "Unknown Client"}</strong>
                {t.adminReview?.reviewNote
                  ? ` — ${t.adminReview.reviewNote}`
                  : ""}
              </span>
              <button
                onClick={onViewTasks}
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
          label="Overdue"
          value={workStats.due}
          sub="Pending deadlines"
          tone="success"
        />

        <Stat
          label="Today's capacity"
          value={`${workStats.capacity?.used ?? 0} / ${workStats.capacity?.limit ?? 0}`}
          sub="Active tasks vs. daily limit"
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
            <span className="cr-section-count">{tasks.length}</span>
          </div>
        </div>

        <div>
          {tasks.map((t) => (
            <div className="cr-task-row" key={t._id}>
              <StatusPill status={STATUS_FROM_BACKEND[t.status] || "new"} />

              <div style={{ flex: 1 }}>
                <div className="cr-task-name">
                  {t.leadId?.fullName || "Unknown Client"}
                  {t.adminReview?.status === "rejected" && (
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
                  {t.concern || "Report"} • Due{" "}
                  {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "-"}
                </div>
              </div>

              <ChevronRight size={15} color="var(--text-faint)" />
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="cr-task-row">No assigned reports</div>
          )}
        </div>
      </div>
    </>
  );
};
