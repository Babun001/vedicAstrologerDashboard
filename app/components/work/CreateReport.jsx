"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema } from "../lib/schemas";
import { useCustomers } from "../hooks/useCustomers";
import { generateReportPDF } from "../lib/pdf-generator";
import { parseDocxToHtml } from "../lib/docx-parser";
import { RichEditor } from "../utils/RichEditor";
import { ReportPreviewModal } from "../utils/ReportPreviewModal";
import {
  Sparkles,
  FileText,
  PenLine,
  User,
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

export default function CreateReport() {
  const { customers, loading } = useCustomers();
  const [previewReport, setPreviewReport] = useState(null);
  const [created, setCreated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      userId: "",
      title: "",
      content: "",
      template: "free",
      adminNotes: "",
    },
  });

  const [selectedTemplate, content, userId] = watch([
    "template",
    "content",
    "userId",
  ]);
  const selectedCustomer = customers.find((c) => c._id === userId) ?? null;

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

  const buildReport = (data) => ({
    id: `r-${Date.now()}`,
    userId: data.userId,
    userName: selectedCustomer?.name ?? "Unknown",
    userEmail: selectedCustomer?.email ?? "",
    title: data.title,
    content: data.content,
    template: data.template,
    status: "created",
    createdAt: new Date().toISOString(),
    adminNotes: data.adminNotes,
  });

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 400));
    const report = buildReport(data);
    setPreviewReport(report);
    setCreated(true);
  };

  const handleDownloadPDF = async () => {
    if (!previewReport) return;
    setGenerating(true);
    try {
      await generateReportPDF(previewReport, selectedCustomer);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="cr-page-head">
        <div className="cr-page-eyebrow">
          <Sparkles size={11} /> New Report
        </div>
        <h1 className="cr-page-title">Create Report</h1>
      </div>

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
              <User size={14} /> Select Client
            </h3>

            <Controller
              name="userId"
              control={control}
              render={({ field }) => (
                <select {...field} className="cr-select">
                  <option value="">— Choose a client —</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName} ({c.planName})
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.userId && (
              <p className="cr-field-error">⚠ {errors.userId.message}</p>
            )}

            {selectedCustomer && (
              <div className="cr-client-preview">
                <p className="cr-client-preview-name">
                  {selectedCustomer.name}
                </p>
                <p className="cr-client-preview-email">
                  {selectedCustomer.email}
                </p>
                <p className="cr-client-preview-meta">
                  DOB: {selectedCustomer.dob} · {selectedCustomer.tob} ·{" "}
                  {selectedCustomer.pobCity}
                </p>
                <p className="cr-client-preview-concern">
                  Concern: {selectedCustomer.concern}
                </p>
              </div>
            )}
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
              {errors.title && (
                <p className="cr-field-error">⚠ {errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="cr-field-label">Admin Notes (optional)</label>
              <textarea
                rows={3}
                placeholder="Internal notes for reference…"
                className="cr-textarea"
                {...register("adminNotes")}
              />
              {errors.adminNotes && (
                <p className="cr-field-error">⚠ {errors.adminNotes.message}</p>
              )}
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

        <div className="cr-action-bar">
          <div className="cr-char-count">
            {content?.replace(/<[^>]+>/g, "").length ?? 0} characters
            {errors.content && (
              <span className="err">⚠ {errors.content.message}</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {previewReport && (
              <>
                <button
                  type="button"
                  className="cr-btn secondary"
                  onClick={handleDownloadPDF}
                  disabled={generating}
                >
                  <Download size={14} />{" "}
                  {generating ? "Generating…" : "Download PDF"}
                </button>
                <button type="button" className="cr-btn secondary">
                  <Eye size={14} /> Preview
                </button>
              </>
            )}

            <button
              type="submit"
              className="cr-btn primary lg"
              disabled={isSubmitting}
            >
              <FileText size={15} />{" "}
              {created ? "Recreate Report" : "Create Report"}
            </button>
          </div>
        </div>
      </form>

      <ReportPreviewModal
        open={!!previewReport && created}
        onClose={() => setCreated(false)}
        report={previewReport}
        customer={selectedCustomer}
      />
    </div>
  );
}
