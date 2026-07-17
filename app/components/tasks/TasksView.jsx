"use client";
import { useState } from "react";
import { GripVertical, CalendarClock, UploadCloud, CheckCircle2 } from "lucide-react";
import { TaskModal } from "./TaskModal";
import {
  columns,
  initialTasks,
  columnColors
} from "../data/demoData";

export const TasksView = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const onDrop = (e, colKey) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: colKey } : t)),
      );
    }
    setDraggingId(null);
    setOverCol(null);
  };

  const selectedTask = tasks.find((t) => t.id === selectedId) || null;

  return (
    <div className="cr-kanban">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        const accent = columnColors[col.key];
        return (
          <div
            key={col.key}
            className={`cr-kcol ${overCol === col.key ? "over" : ""}`}
            style={{ "--col-accent": accent }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverCol(col.key);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
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
                  className={`cr-kcard ${draggingId === t.id ? "dragging" : ""}`}
                  key={t.id}
                  style={{ "--col-accent": accent }}
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
                      <CalendarClock size={11} /> {t.due}
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
          onMove={(status) => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === selectedTask.id ? { ...t, status } : t,
              ),
            );
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};
