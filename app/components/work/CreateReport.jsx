"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { RichEditor } from "../utils/RichEditor";
import { ReportPreviewModal } from "../utils/ReportPreviewModal";
import { parseDocxToHtml } from "../lib/docx-parser";
import {
  Sparkles,
  FileText,
  PenLine,
  Eye,
  Download,
  CheckCircle2,
  Star,
  Upload,
  X,
  FileUp,
  AlertCircle,
  Loader2,
  BookOpen,
  Wand2,
  ChevronRight,
} from "lucide-react";
import axiosInstanceClient from "../services/client.services";

const TEMPLATES = [
  {
    id: "free",
    label: "Free",
    desc: "Basic report with essential insights",
    icon: <FileText size={20} />,
  },
  {
    id: "Basic Horoscope",
    label: "Basic Horoscope",
    desc: "Detailed analysis with remedies",
    icon: <PenLine size={20} />,
  },
  {
    id: "Divine Destiny Report",
    label: "Divine Destiny Report",
    desc: "Comprehensive Jyotish full analysis",
    icon: <Sparkles size={20} />,
  },
];

const STARTER_TEMPLATES = {
  free: `<h2>Birth Chart Overview</h2><p>Based on the birth details provided, this report presents a concise analysis of the key planetary positions and their influences on your life.</p><h2>Key Planetary Positions</h2><ul><li>Sun Sign:</li><li>Moon Sign:</li><li>Ascendant (Lagna):</li></ul><h2>Guidance</h2><p>Add your guidance here.</p>`,
  "Basic Horoscope": `<h2>Natal Chart Analysis</h2><p>This Basic Horoscope Report presents a detailed Vedic Jyotish analysis encompassing your natal chart, current planetary transits, and upcoming Dasha periods.</p><h2>Lagna & Planetary Strength</h2><p>Describe the ascendant and key planet positions here.</p><h2>Career & Finance</h2><p>Analysis of the 10th and 2nd house lords...</p><h2>Relationships</h2><p>Analysis of the 7th house...</p><h2>Remedies</h2><ul><li>Gemstone recommendation:</li><li>Mantra:</li><li>Charity:</li></ul>`,
  "Divine Destiny Report": `<h2>Executive Summary</h2><p>This Divine Destiny Report provides the most comprehensive analysis of your birth chart, combining classical Parashari Jyotish with Jaimini techniques.</p><h2>Natal Chart — Detailed Analysis</h2><p>Ascendant, planets, houses...</p><h2>Vimshottari Dasha</h2><p>Current Dasha period and its implications...</p><h2>Career & Dharma</h2><p>Detailed 10th house analysis...</p><h2>Relationships & Marriage</h2><p>7th house, Venus, Jaimini analysis...</p><h2>Health & Wellness</h2><p>6th house, Moon, Ascendant lord...</p><h2>Spiritual Path</h2><p>9th house, 12th house, Ketu...</p><h2>Remedies & Prescriptions</h2><ul><li><strong>Gemstone:</strong></li><li><strong>Yantra:</strong></li><li><strong>Mantra:</strong></li><li><strong>Fasting:</strong></li><li><strong>Charity:</strong></li></ul><h2>Conclusion</h2><p>Summary and blessings...</p>`,
};

function DocxUploadCard({ onImport }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle");
  const [info, setInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const processFile = useCallback(
    async (file) => {
      if (!file.name.endsWith(".docx")) {
        setStatus("error");
        setErrorMsg(
          "Only .docx files are supported. Please upload a Word document.",
        );
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setStatus("error");
        setErrorMsg("File is too large (max 20 MB).");
        return;
      }

      setStatus("parsing");
      setErrorMsg("");
      setInfo(null);

      try {
        const result = await parseDocxToHtml(file);
        setInfo({
          name: file.name,
          pages: result.pageEstimate,
          warnings: result.warnings,
        });
        setStatus("done");
        onImport(result.html, file.name.replace(/\.docx$/i, ""));
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg(
          "Failed to parse the document. Make sure it is a valid .docx file.",
        );
      }
    },
    [onImport],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setStatus("idle");
    setInfo(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="cr-form-card">
      <div className="cr-form-card-head">
        <h3 className="cr-form-card-title">
          <FileUp size={14} />
          Import Word Document
          <span className="cr-pill new" style={{ marginLeft: 4 }}>
            .docx
          </span>
        </h3>
        {status === "done" && (
          <button type="button" onClick={reset} className="cr-remove-file">
            <X size={11} /> Replace file
          </button>
        )}
      </div>

      {status === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cr-dropzone ${dragOver ? "drag" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div className="cr-dropzone-icon">
            <Upload size={22} />
          </div>

          <div>
            <p className="cr-dropzone-title">
              {dragOver ? "Drop your .docx here" : "Drag & drop your Word file"}
            </p>
            <p className="cr-dropzone-sub">
              or <b>click to browse</b> · 40–50 pages supported · Max 20 MB
            </p>
          </div>

          <div className="cr-dropzone-note">
            <Wand2 size={13} />
            <p>
              Your document will be parsed and re-applied with the{" "}
              <strong>Vedic template</strong> — header, footer &amp; decorative
              border on every page.
            </p>
          </div>
        </div>
      )}

      {status === "parsing" && (
        <div className="cr-state-box parsing">
          <div className="cr-state-icon-circle">
            <Loader2 size={22} className="cr-spin" />
          </div>
          <div>
            <p className="cr-state-title">Parsing document…</p>
            <p className="cr-state-sub">
              Extracting content & applying Vedic template
            </p>
          </div>
          <div className="cr-progress-track">
            <div className="cr-progress-fill" />
          </div>
        </div>
      )}

      {status === "done" && info && (
        <div className="cr-success-box">
          <div className="cr-success-row">
            <div className="cr-success-icon">
              <CheckCircle2 size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="cr-success-name">{info.name}</p>
              <div className="cr-success-meta">
                <span>
                  <BookOpen size={10} /> ~{info.pages} pages detected
                </span>
                <span>
                  <CheckCircle2 size={10} /> Content imported into editor
                </span>
              </div>
              {info.warnings.length > 0 && (
                <p className="cr-success-warn">
                  <AlertCircle size={9} />
                  {info.warnings.length} formatting note(s) — complex styles may
                  need adjustment
                </p>
              )}
            </div>
          </div>

          <div className="cr-pipeline">
            {[
              "Content Extracted",
              "Vedic Header",
              "Vedic Footer",
              "Page Border",
              "PDF Ready",
            ].map((step, i) => (
              <div
                key={step}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span className="cr-pipeline-step">✓ {step}</span>
                {i < 4 && (
                  <ChevronRight size={9} className="cr-pipeline-arrow" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="cr-error-box">
          <div className="cr-error-row">
            <AlertCircle
              size={16}
              color="var(--danger)"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <p className="cr-error-title">Import failed</p>
              <p className="cr-error-msg">{errorMsg}</p>
              <button type="button" onClick={reset} className="cr-error-retry">
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * `report` is the task object clicked in TasksView/MyWorkView — it must
 * carry at least `reportId` (the real backend Report._id) and, once the
 * backend populates it, `clientName`/`clientEmail`. There is no client
 * picker here on purpose: which client this report is for is fixed by
 * the backend the moment the order was paid — the astrologer doesn't
 * choose it.
 */
export default function CreateReport({ report }) {
  const [previewReport, setPreviewReport] = useState(null);
  const [created, setCreated] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isRevision = report?.adminReview?.status === "rejected";

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      content: report?.content || "",
      template: "free",
      title: "",
      adminNotes: "",
    },
  });

  const [selectedTemplate, content] = watch(["template", "content"]);

  const applyTemplate = useCallback(
    (tplId) => {
      setValue("template", tplId, { shouldValidate: true });
      if (!content || content === "" || content.startsWith("<")) {
        setValue("content", STARTER_TEMPLATES[tplId] ?? "", {
          shouldValidate: false,
        });
      }
    },
    [setValue, content],
  );

  const handleDocxImport = useCallback(
    (html, filename) => {
      setValue("content", html, { shouldValidate: false });
      const currentTitle = watch("title");
      if (!currentTitle) setValue("title", filename, { shouldValidate: false });
    },
    [setValue, watch],
  );

  const onSubmit = async (data) => {
    setSubmitError("");

    if (!report?.reportId) {
      setSubmitError(
        "No report selected — go back to the task board and open a task first.",
      );
      return;
    }

    try {
      const finalContent = data.title
        ? `<h1>${data.title}</h1>${data.content}`
        : data.content;

      const response = await axiosInstanceClient.post(
        `/astrologer/reports/${report.reportId}/generate`,
        { content: finalContent },
      );

      setPreviewReport({
        title: data.title,
        content: finalContent,
        cdnUrl: response.data?.data?.report?.cdnUrl,
        status: response.data?.data?.report?.status,
      });
      setCreated(true);
    } catch (error) {
      console.error("Generate report failed:", error.response?.data || error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to generate report. Make sure this task is in 'Processing' before generating.",
      );
    }
  };

  return (
    <div>
      <div className="cr-page-head">
        <div className="cr-page-eyebrow">
          <Sparkles size={11} /> {isRevision ? "Revision" : "New Report"}
        </div>
        <h1 className="cr-page-title">
          {isRevision ? "Fix Report" : "Create Report"}
        </h1>
      </div>

      {isRevision && (
        <div
          className="cr-error-box"
          style={{
            marginBottom: 18,
            background: "rgba(176,58,46,0.06)",
            borderColor: "rgba(176,58,46,0.3)",
          }}
        >
          <div className="cr-error-row">
            <AlertCircle
              size={16}
              color="#b03a2e"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <p className="cr-error-title" style={{ color: "#b03a2e" }}>
                Admin requested revisions
              </p>
              <p className="cr-error-msg">
                {report.adminReview.reviewNote ||
                  "No specific note was provided."}
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div className="cr-form-card">
          <h3 className="cr-form-card-title" style={{ marginBottom: 14 }}>
            <Sparkles size={14} /> Choose Template
          </h3>

          <div className="cr-grid-3">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl.id)}
                className={`cr-tpl-card ${selectedTemplate === tpl.id ? "active" : ""}`}
              >
                {selectedTemplate === tpl.id && (
                  <CheckCircle2 size={14} className="cr-tpl-check" />
                )}
                <div className="cr-tpl-icon">{tpl.icon}</div>
                <p className="cr-tpl-label">{tpl.label}</p>
                <p className="cr-tpl-desc">{tpl.desc}</p>
                <span className="cr-tpl-badge">
                  <Star size={8} /> {tpl.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="cr-grid-2">
          <div className="cr-form-card">
            <h3 className="cr-form-card-title" style={{ marginBottom: 14 }}>
              Client
            </h3>
            <div className="cr-client-preview">
              <p>Client: {report?.clientName || report?.client || "—"}</p>
              <p>Email: {report?.clientEmail || "—"}</p>
            </div>
          </div>

          <div
            className="cr-form-card"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label className="cr-field-label">Report Title</label>
              <div className="cr-field">
                <input
                  placeholder="e.g. Annual Vedic Horoscope 2024 — Priya Sharma"
                  {...register("title")}
                />
              </div>
            </div>

            <div>
              <label className="cr-field-label">Admin Notes (optional)</label>
              <textarea
                rows={3}
                placeholder="Internal notes for reference…"
                className="cr-textarea"
                {...register("adminNotes")}
              />
            </div>
          </div>
        </div>

        <DocxUploadCard onImport={handleDocxImport} />

        <div className="cr-form-card">
          <div className="cr-form-card-head">
            <h3 className="cr-form-card-title">
              <PenLine size={14} /> Report Content
            </h3>
            <span className="cr-editor-hint">
              <FileText size={10} /> You can type directly or import a .docx
              above
            </span>
          </div>

          <Controller
            name="content"
            control={control}
            rules={{ required: "Report content is required" }}
            render={({ field }) => (
              <RichEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Start writing the astrology report… or import a Word document above ↑"
                error={errors.content?.message}
                minHeight="420px"
              />
            )}
          />
        </div>

        {submitError && (
          <div className="cr-error-box">
            <div className="cr-error-row">
              <AlertCircle
                size={16}
                color="var(--danger)"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <p className="cr-error-msg">{submitError}</p>
            </div>
          </div>
        )}

        <div className="cr-action-bar">
          <div className="cr-char-count">
            {content?.replace(/<[^>]+>/g, "").length ?? 0} characters
            {errors.content && (
              <span className="err">⚠ {errors.content.message}</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {previewReport?.cdnUrl && (
              <a
                href={previewReport.cdnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cr-btn secondary"
              >
                <Download size={14} /> View Generated PDF
              </a>
            )}

            {previewReport && (
              <button
                type="button"
                className="cr-btn secondary"
                onClick={() => setCreated(true)}
              >
                <Eye size={14} /> Preview
              </button>
            )}

            <button
              type="submit"
              className="cr-btn primary lg"
              disabled={isSubmitting}
            >
              <FileText size={15} />{" "}
              {isSubmitting
                ? "Generating…"
                : created
                  ? "Regenerate Report"
                  : "Generate Report"}
            </button>
          </div>
        </div>
      </form>

      <ReportPreviewModal
        open={!!previewReport && created}
        onClose={() => setCreated(false)}
        report={previewReport}
        customer={null}
      />
    </div>
  );
}
