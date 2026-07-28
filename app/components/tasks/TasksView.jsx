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
import { STATUS_TO_BACKEND, STATUS_FROM_BACKEND } from "../data/statusMap";
import { KanbanSkeleton } from "../common/Skeleton";

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

export const TasksView = ({ onGenerateReport }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [generateReportId, setGenerateReportId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const res = await axiosInstanceClient.get("/astrologer/reports");

        const board = res.data.data.board;

        const reports = [
          ...board.pending,
          ...board.processing,
          ...board.completed,
          ...board.delivered,
        ];

        const formattedTasks = reports.map((report) => ({
          id: report._id,
          reportId: report._id, // ADD THIS — keep the real id under an unambiguous name
          client: report.leadId?.fullName || "Unknown Client", // also fixes blank names, see Step 5
          service: report.concern || "Astrology Report",
          due: report.dueAt || "-",
          priority: report.priority || "medium",
          who: report.assignedTo?.name || "—",
          status: STATUS_FROM_BACKEND[report.status],
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Failed fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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

                  <div className="cr-kservice">{t.service}</div>

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
          onGenerate={(task) => {
            onGenerateReport(task);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};
