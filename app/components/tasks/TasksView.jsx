"use client";

import { useEffect, useState } from "react";
import {
  GripVertical,
  CalendarClock,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

import { TaskModal } from "./TaskModal";
import { columns, columnColors } from "../data/demoData";
import axiosInstanceClient from "../services/client.services";
import { STATUS_TO_BACKEND } from "../data/statusMap";
import { KanbanSkeleton } from "../common/Skeleton";
import { formatReportTask } from "../lib/workFormat";
import { RefreshButton } from "../common/RefreshButton";
import { Eyebrow } from "../common/Eyebrow";

// Frontend -> Backend
// const STATUS_TO_BACKEND = {
//   new: "pending",
//   progress: "processing",
// };

// Backend -> Frontend
// const STATUS_FROM_BACKEND = {
//   pending: "new",
//   processing: "progress",
//   completed: "ready",
//   delivered: "delivered",
// };

export const TasksView = ({ onGenerateReport, initialSelectedId, onInitialSelectedConsumed }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [generateReportId, setGenerateReportId] = useState(null);

  const fetchReports = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await axiosInstanceClient.get("/astrologer/reports");
      const board = res.data.data.board;
      const reports = [
        ...board.pending,
        ...board.processing,
        ...board.completed,
        ...board.delivered,
      ];

      setTasks(reports.map(formatReportTask));
    } catch (error) {
      console.error("Failed fetching reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Arriving here from MyWorkView's "assigned to you" list — open the
  // specific report's modal as soon as we know which one, then tell the
  // parent it's been consumed so navigating back to this tab later
  // (e.g. via the sidebar) doesn't reopen a stale modal.
  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      onInitialSelectedConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedId]);

  useEffect(() => {
    const token = localStorage.getItem("astrologerToken");
    if (!token) return;

    const streamUrl = `${axiosInstanceClient.defaults.baseURL}/astrologer/stream?token=${token}`;
    const es = new EventSource(streamUrl);

    es.addEventListener("new-task-assigned", () => {
      fetchReports({ silent: true });
    });

    return () => es.close();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const backendStatus = STATUS_TO_BACKEND[newStatus];

    if (!backendStatus) {
      return;
    }

    try {
      await axiosInstanceClient.patch(`/astrologer/reports/${id}/status`, {
        status: backendStatus,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status: newStatus,
              }
            : task,
        ),
      );
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const onDrop = (e, colKey) => {
    e.preventDefault();

    const id = e.dataTransfer.getData("text/plain") || draggingId;

    // Block invalid moves
    if (colKey === "ready" || colKey === "delivered") {
      console.log("Generate report before moving to ready");

      setDraggingId(null);
      setOverCol(null);

      return;
    }

    if (id) {
      updateStatus(id, colKey);
    }

    setDraggingId(null);
    setOverCol(null);
  };

  const selectedTask = tasks.find((t) => t.id === selectedId) || null;

  if (loading) {
    return <KanbanSkeleton columnCount={columns.length} />;
  }

  return (
    <>
      <div className="cr-page-head-row">
        <Eyebrow>Report tasks</Eyebrow>
        <RefreshButton
          onClick={() => fetchReports({ silent: true })}
          loading={refreshing}
        />
      </div>

      <div className="cr-kanban">
        {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);

        const accent = columnColors[col.key];

        return (
          <div
            key={col.key}
            className={`cr-kcol ${overCol === col.key ? "over" : ""}`}
            style={{
              "--col-accent": accent,
            }}
            onDragOver={(e) => {
              e.preventDefault();

              e.dataTransfer.dropEffect = "move";

              setOverCol(col.key);
            }}
            onDragLeave={() => {
              setOverCol((c) => (c === col.key ? null : c));
            }}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="cr-kcol-head">
              <div className="cr-kcol-title-wrap">
                <span className="cr-kcol-dot" />

                <span className="cr-kcol-title">{col.label}</span>
              </div>

              <span className="cr-section-count">{items.length}</span>
            </div>

            <div className="cr-kcol-bar" />

            <div className="cr-kcol-body">
              {items.map((t) => (
                <div
                  className={`cr-kcard ${
                    draggingId === t.id ? "dragging" : ""
                  }`}
                  key={t.id}
                  draggable="true"
                  onDragStart={(e) => {
                    setDraggingId(t.id);

                    e.dataTransfer.effectAllowed = "move";

                    e.dataTransfer.setData("text/plain", t.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);

                    setOverCol(null);
                  }}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="cr-kcard-top">
                    <div className="cr-kclient">{t.client}</div>

                    <GripVertical size={13} color="var(--text-faint)" />
                  </div>

                  {t.adminReview?.status === "rejected" && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#b03a2e",
                        background: "rgba(176,58,46,0.1)",
                        borderRadius: 6,
                        padding: "3px 8px",
                        marginTop: 6,
                        marginBottom: 4,
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      ⚠ Revision requested
                    </div>
                  )}

                  <div className="cr-kmeta-row">
                    <span className={`cr-priority ${t.priority}`} />

                    <span className="cr-kdue">
                      <CalendarClock size={11} />

                      {t.due}
                    </span>
                  </div>

                  <div className="cr-kfoot">
                    <div className="cr-kassignee">
                      <div className="cr-kdot">
                        {t.who === "—" ? "·" : t.who}
                      </div>

                      {t.who === "—" ? "Unassigned" : t.who}
                    </div>

                    {col.key === "ready" && (
                      <UploadCloud size={14} color="var(--success)" />
                    )}

                    {col.key === "delivered" && (
                      <CheckCircle2 size={14} color="var(--success)" />
                    )}
                  </div>
                </div>
              ))}

              {items.length === 0 && <div className="cr-kempty">Drop here</div>}
            </div>
          </div>
        );
      })}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          accent={columnColors[selectedTask.status]}
          onClose={() => setSelectedId(null)}
          onGenerate={(task) => {
            onGenerateReport(task);
            setSelectedId(null);
          }}
        />
      )}
      </div>
    </>
  );
};
