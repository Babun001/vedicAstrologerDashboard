import { CheckCircle2, IndianRupee } from "lucide-react";
import { StatusPill } from "../common/StatusPill";

export const QuestionModal = ({ question, accent, onClose, onAnswer }) => (
  <div className="cr-modal-backdrop" onClick={onClose}>
    <div
      className="cr-modal"
      style={{ "--col-accent": accent }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cr-modal-top" />
      <div className="cr-modal-head">
        <div>
          <div className="cr-modal-client">{question.client}</div>
          <div className="cr-modal-service">
            {question.planName ? `${question.planName} · ` : ""}Question #
            {question.sequence}
          </div>
        </div>
        <div className="cr-modal-close" onClick={onClose}>
          ✕
        </div>
      </div>

      <div className="cr-modal-body">
        <div className="cr-modal-row">
          <div>
            <div className="cr-modal-field-label">Status</div>
            <StatusPill status={question.status} />
          </div>
          <div>
            <div className="cr-modal-field-label">Concern</div>
            <div className="cr-modal-field-value">
              {question.concern || "—"}
            </div>
          </div>
          <div>
            <div className="cr-modal-field-label">Due</div>
            <div className="cr-modal-field-value">{question.due}</div>
          </div>
        </div>

        <div className="cr-modal-divider" />

        <div className="cr-modal-section-title">Question</div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text)",
            background: "var(--surface-2, rgba(0,0,0,0.03))",
            border: "1px solid var(--border, rgba(0,0,0,0.08))",
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {question.questionText}
        </div>

        {question.birthDetails && (
          <>
            <div className="cr-modal-section-title">Birth details</div>
            <div className="cr-modal-check done">
              <CheckCircle2 size={14} color="var(--success)" />
              {question.birthDetails.gender
                ? `${question.birthDetails.gender} · `
                : ""}
              {question.birthDetails.dob || "—"} at{" "}
              {question.birthDetails.tob || "—"}
            </div>
            <div className="cr-modal-check done">
              <CheckCircle2 size={14} color="var(--success)" />
              Born in {question.birthDetails.pobCity || "—"},{" "}
              {question.birthDetails.pobCountry || "—"}
              {question.birthDetails.currentCountry
                ? ` · now in ${question.birthDetails.currentCountry}`
                : ""}
            </div>
          </>
        )}

        {question.status === "delivered" && question.answerText && (
          <>
            <div className="cr-modal-divider" />
            {typeof question.payoutRate === "number" && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--success)",
                  background: "var(--cream-panel, rgba(0,0,0,0.03))",
                  border: "1px solid var(--tan-border-soft, rgba(0,0,0,0.08))",
                  borderRadius: 8,
                  padding: "5px 10px",
                  marginBottom: 12,
                }}
              >
                <IndianRupee size={12} />
                Earned {question.payoutCurrency === "USD" ? "$" : "₹"}
                {question.payoutRate} for this answer
              </div>
            )}
            <div className="cr-modal-section-title">Your answer</div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                background: "var(--surface-2, rgba(0,0,0,0.03))",
                borderRadius: 8,
                padding: "10px 12px",
                lineHeight: 1.5,
              }}
              dangerouslySetInnerHTML={{ __html: question.answerText }}
            />
          </>
        )}

        <div className="cr-modal-actions">
          {question.status !== "delivered" && (
            <div
              className="cr-modal-btn primary"
              onClick={() => onAnswer(question)}
            >
              Answer Question
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