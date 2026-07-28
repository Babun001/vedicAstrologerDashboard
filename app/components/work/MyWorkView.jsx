"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { StatusPill } from "../common/StatusPill";
import { Eyebrow } from "../common/Eyebrow";
import axiosInstanceClient from "../services/client.services";
import { STATUS_FROM_BACKEND } from "../data/statusMap";

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

export const MyWorkView = () => {
  const [workStats, setWorkStats] = useState({
    assigned: 0,
    delivered: 0,
    due: 0,
  });

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const [workResponse, reportsResponse] = await Promise.all([
          axiosInstanceClient.get("/astrologer/my-work"),

          axiosInstanceClient.get("/astrologer/reports"),
        ]);

        console.log("My work:", workResponse.data);

        console.log("Reports:", reportsResponse.data);

        setWorkStats(workResponse.data.data);

        const board = reportsResponse.data.data.board;

        // Flatten all report statuses
        const flattenedReports = [
          ...board.pending,
          ...board.processing,
          ...board.completed,
          ...board.delivered,
        ];

        setTasks(flattenedReports);
      } catch (error) {
        console.error("Failed to fetch astrologer work:", error);
      }
    };

    fetchWork();
  }, []);

  return (
    <>
      <Eyebrow>Today</Eyebrow>

      <div className="cr-stat-grid">
        <Stat
          label="Assigned today"
          value={workStats.assigned}
          sub="Reports assigned"
        />

        <Stat
          label="Reports delivered"
          value={workStats.delivered}
          sub="Completed this week"
        />

        <Stat
          label="Overdue"
          value={workStats.due}
          sub="Pending deadlines"
          tone="success"
        />

        {/* No backend API yet */}
        <Stat label="Replied" value="-" sub="Inbox analytics coming soon" />
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
