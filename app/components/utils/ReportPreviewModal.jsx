"use client";

import { Download, FileText, Sparkles, X, CheckCircle2 } from "lucide-react";

export function ReportPreviewModal({ open, onClose, report }) {
  if (!open || !report) return null;

  return (
    <div className="cr-modal-backdrop" onClick={onClose}>
      <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cr-modal-top" />

        <div className="cr-modal-head">
          <div>
            <div className="cr-modal-client">{report.title || "Report Preview"}</div>
            <div className="cr-modal-service">
              <Sparkles size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
              Submitted for admin review
            </div>
          </div>
          <div className="cr-modal-close" onClick={onClose}>
            <X size={16} />
          </div>
        </div>

        <div className="cr-modal-body">
          <div
            style={{
              background: "var(--surface-2, #f7f2e6)",
              border: "1px solid var(--border, #e8d5a3)",
              borderRadius: 10,
              padding: 18,
              marginBottom: 16,
              maxHeight: 250,
              overflowY: "auto",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text)",
            }}
            dangerouslySetInnerHTML={{ __html: report.content }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              background: "rgba(46,125,50,0.08)",
              border: "1px solid rgba(46,125,50,0.25)",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <CheckCircle2 size={15} color="var(--success)" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              This report has been generated and sent to the admin for review.
              You'll be notified here if any revisions are requested.
            </div>
          </div>
        </div>

        <div className="cr-modal-actions">
          {report.cdnUrl && (
            <a
              href={report.cdnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cr-btn secondary"
            >
              <Download size={14} /> Download PDF
            </a>
          )}

          <div className="cr-modal-btn ghost" onClick={onClose}>
            Close
          </div>
        </div>
      </div>
    </div>
  );
}