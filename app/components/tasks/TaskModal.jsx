import { CheckCircle2 } from "lucide-react";
import { StatusPill } from "../common/StatusPill";

export const TaskModal = ({ task, accent, onClose, onMove }) => (
  <div className="cr-modal-backdrop" onClick={onClose}>
    <div
      className="cr-modal"
      style={{ "--col-accent": accent }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cr-modal-top" />
      <div className="cr-modal-head">
        <div>
          <div className="cr-modal-client">{task.client}</div>
          <div className="cr-modal-service">{task.service}</div>
        </div>
        <div className="cr-modal-close" onClick={onClose}>
          ✕
        </div>
      </div>
      <div className="cr-modal-body">
        <div className="cr-modal-row">
          <div>
            <div className="cr-modal-field-label">Status</div>
            <StatusPill status={task.status} />
          </div>
          <div>
            <div className="cr-modal-field-label">Priority</div>
            <div
              className="cr-modal-field-value"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span className={`cr-priority ${task.priority}`} />
              {task.priority === "high"
                ? "High"
                : task.priority === "med"
                  ? "Medium"
                  : "Low"}
            </div>
          </div>
          <div>
            <div className="cr-modal-field-label">Assigned to</div>
            <div className="cr-modal-field-value">
              {task.who === "—" ? "Unassigned" : task.who}
            </div>
          </div>
          <div>
            <div className="cr-modal-field-label">Due</div>
            <div className="cr-modal-field-value">{task.due}</div>
          </div>
        </div>

        <div className="cr-modal-divider" />

        <div className="cr-modal-section-title">Birth details</div>
        <div className="cr-modal-check done">
          <CheckCircle2 size={14} color="var(--success)" /> Name, DOB, time &
          place received
        </div>
        <div className="cr-modal-check done">
          <CheckCircle2 size={14} color="var(--success)" /> Questionnaire
          submitted
        </div>
        <div
          className={`cr-modal-check ${task.status === "ready" || task.status === "delivered" ? "done" : ""}`}
        >
          <CheckCircle2
            size={14}
            color={
              task.status === "ready" || task.status === "delivered"
                ? "var(--success)"
                : "var(--text-faint)"
            }
          />
          Final PDF{" "}
          {task.status === "ready" || task.status === "delivered"
            ? "uploaded"
            : "pending upload"}
        </div>

        <div className="cr-modal-actions">
          {task.status !== "ready" && task.status !== "delivered" && (
            <div
              className="cr-modal-btn primary"
              onClick={() => onMove("ready")}
            >
              Mark ready
            </div>
          )}
          {task.status === "ready" && (
            <div
              className="cr-modal-btn primary"
              onClick={() => onMove("delivered")}
            >
              Mark delivered
            </div>
          )}
          <div className="cr-modal-btn ghost" onClick={onClose}>
            Close
          </div>
        </div>
      </div>
    </div>
  </div>
);