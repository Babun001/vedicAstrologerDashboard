"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Send,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import { RichEditor } from "../utils/RichEditor";
import axiosInstanceClient from "../services/client.services";
import { useEarnings } from "../context/EarningsContext";

// ─────────────────────────────────────────────────────────────────────
// FEATURE FLAG — AI drafting is now live via
// POST /astrologer/questions/:id/generate (OpenAI, draft-from-scratch).
// Flip back to `false` to hide the AI Assist card again without
// touching anything else.
// ─────────────────────────────────────────────────────────────────────
const AI_GENERATION_ENABLED = true;

/**
 * `question` is the object clicked from QuestionsView/QuestionModal — it
 * already carries questionText, concern, birthDetails, etc. from the
 * board list endpoint, same convention as CreateReport's `report` prop.
 * Must carry at least `questionId` (the real Question._id).
 */
export default function AnswerQuestion({ question, onBack }) {
  // Optional steer typed by the astrologer before generating — sent as
  // astrologerNotes, NOT as a draft. The /generate endpoint writes the
  // answer from scratch using the question + client's birth details.
  const [aiNotes, setAiNotes] = useState("");
  const [answer, setAnswer] = useState("");
  // Untouched AI output, kept for the aiAssisted/rawAnswerText audit
  // trail even after the astrologer edits `answer` in the editor.
  const [rawGeneratedAnswer, setRawGeneratedAnswer] = useState("");
  const [aiAssisted, setAiAssisted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  const { perAnswerRate, currency, refetch: refetchEarnings } = useEarnings();

  const plainTextLength = answer.replace(/<[^>]+>/g, "").length;

  const handleGenerate = async () => {
    if (!AI_GENERATION_ENABLED) return; // guarded — button is disabled too

    if (!question?.questionId) {
      setGenError(
        "No question selected — go back to the board and open a question first.",
      );
      return;
    }

    setGenError("");
    setGenerating(true);

    try {
      const res = await axiosInstanceClient.post(
        `/astrologer/questions/${question.questionId}/generate`,
        aiNotes.trim() ? { astrologerNotes: aiNotes.trim() } : {},
      );

      const generated = res.data?.data?.generatedAnswer || "";
      setAnswer(generated);
      setRawGeneratedAnswer(generated);
      setAiAssisted(true);
    } catch (error) {
      console.error("AI generation failed:", error);
      setGenError(
        error.response?.data?.message ||
          "The AI assistant is unavailable right now. You can still write your own answer below.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // Editing the answer after an AI generation still counts as
  // "AI-assisted" for the audit trail (rawGeneratedAnswer keeps the
  // original AI output; answerText is whatever ships). Typing from
  // scratch with no generation ever having run keeps aiAssisted false.
  const handleAnswerChange = (html) => {
    setAnswer(html);
  };

  const handleSend = async () => {
    setSendError("");

    if (plainTextLength < 10) {
      setSendError(
        "Please write a bit more before sending — answers need at least 10 characters.",
      );
      return;
    }

    if (!question?.questionId) {
      setSendError(
        "No question selected — go back to the board and open a question first.",
      );
      return;
    }

    setSending(true);

    try {
      await axiosInstanceClient.post(
        `/astrologer/questions/${question.questionId}/answer`,
        {
          answerText: answer,
          rawAnswerText: aiAssisted ? rawGeneratedAnswer : answer,
          aiAssisted,
        },
      );

      setSent(true);
      // Live-update the topbar income badge immediately — don't wait for
      // the next poll/SSE tick. The rate that was just snapshotted onto
      // this question is whatever perAnswerRate currently is.
      refetchEarnings();
    } catch (error) {
      console.error("Send answer failed:", error);
      setSendError(
        error.response?.data?.message ||
          "Failed to send the answer. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        className="cr-form-card"
        style={{ textAlign: "center", padding: "48px 24px" }}
      >
        <CheckCircle2
          size={36}
          color="var(--success)"
          style={{ marginBottom: 12 }}
        />
        <h2 className="cr-page-title" style={{ marginBottom: 6 }}>
          Answer sent
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
          {question.client} will see this on their dashboard, and a notification
          email is on its way to them.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--success)",
            background: "var(--cream-panel)",
            border: "1px solid var(--tan-border-soft)",
            borderRadius: 8,
            padding: "6px 12px",
            marginBottom: 20,
          }}
        >
          <IndianRupee size={13} />
          You earned {currency === "INR" ? "₹" : currency + " "}
          {perAnswerRate} for this answer
        </div>
        <br />
        <button type="button" className="cr-btn primary" onClick={onBack}>
          <ArrowLeft size={14} /> Back to questions
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="cr-page-head">
        <div className="cr-page-eyebrow">
          <Sparkles size={11} /> Answering
        </div>
        <h1 className="cr-page-title">
          Reply to {question?.client || "client"}
        </h1>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--success)",
          }}
          title="Your current per-answer rate — set from your Profile page"
        >
          <IndianRupee size={12} />
          {currency === "INR" ? "₹" : currency + " "}
          {perAnswerRate} for this answer
        </div>
      </div>

      <div className="cr-grid-2" style={{ marginBottom: 18 }}>
        <div className="cr-form-card">
          <h3 className="cr-form-card-title" style={{ marginBottom: 10 }}>
            Client
          </h3>
          <div className="cr-client-preview">
            <p className="cr-client-preview-name">{question?.client || "—"}</p>
            {question?.birthDetails && (
              <>
                <p className="cr-client-preview-meta">
                  {question.birthDetails.gender
                    ? `${question.birthDetails.gender} · `
                    : ""}
                  {question.birthDetails.dob || "—"} at{" "}
                  {question.birthDetails.tob || "—"}
                </p>
                <p className="cr-client-preview-meta">
                  Born in {question.birthDetails.pobCity || "—"},{" "}
                  {question.birthDetails.pobCountry || "—"}
                </p>
              </>
            )}
            {question?.concern && (
              <p className="cr-client-preview-concern">{question.concern}</p>
            )}
          </div>
        </div>

        <div className="cr-form-card">
          <h3 className="cr-form-card-title" style={{ marginBottom: 10 }}>
            Their question
          </h3>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
            {question?.questionText}
          </p>
        </div>
      </div>

      {/* ── AI assist — draft-from-scratch via OpenAI /generate ── */}
      <div className="cr-form-card" style={{ marginBottom: 18 }}>
        <div className="cr-form-card-head">
          <h3 className="cr-form-card-title">
            <Wand2 size={14} /> AI Assist
          </h3>
          {!AI_GENERATION_ENABLED && (
            <span
              className="cr-pill new"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <Lock size={10} /> Coming soon
            </span>
          )}
        </div>

        <p className="cr-form-card-hint" style={{ marginBottom: 10 }}>
          Optionally add a few words to steer the draft — AI will write a
          full first-pass answer you can edit below before sending. It
          doesn't know the client's calculated chart, so always verify any
          astrological detail against your own reading before you send.
          {!AI_GENERATION_ENABLED &&
            " This is disabled until the AI credits are activated — write your answer directly in the editor below for now."}
        </p>

        <textarea
          rows={2}
          className="cr-textarea"
          placeholder="Optional — e.g. focus on career timing, keep it brief, client already knows their sun sign"
          value={aiNotes}
          onChange={(e) => setAiNotes(e.target.value)}
          disabled={!AI_GENERATION_ENABLED}
        />

        {genError && (
          <div className="cr-field-error" style={{ marginTop: 6 }}>
            ⚠ {genError}
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            className="cr-btn secondary"
            onClick={handleGenerate}
            disabled={!AI_GENERATION_ENABLED || generating}
            title={
              AI_GENERATION_ENABLED
                ? "Generate a first-draft answer"
                : "AI generation isn't active yet — write your answer directly below"
            }
          >
            <Sparkles size={14} />
            {generating ? "Generating…" : "Generate with AI"}
          </button>
        </div>
      </div>

      {/* ── Final answer — always available, works today with no AI ── */}
      <div className="cr-form-card" style={{ marginBottom: 18 }}>
        <div className="cr-form-card-head">
          <h3 className="cr-form-card-title">Your Answer</h3>
          <span className="cr-editor-hint">
            {aiAssisted
              ? "Generated by AI — edit as needed"
              : "Write your answer here"}
          </span>
        </div>

        <RichEditor
          value={answer}
          onChange={handleAnswerChange}
          placeholder="Write your answer to the client here…"
          minHeight="320px"
        />
      </div>

      {sendError && (
        <div className="cr-error-box" style={{ marginBottom: 18 }}>
          <div className="cr-error-row">
            <AlertCircle
              size={16}
              color="var(--danger)"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <p className="cr-error-msg">{sendError}</p>
          </div>
        </div>
      )}

      <div className="cr-action-bar">
        <div className="cr-char-count">{plainTextLength} characters</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="cr-btn secondary"
            onClick={onBack}
            disabled={sending}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            className="cr-btn primary lg"
            onClick={handleSend}
            disabled={sending}
          >
            <Send size={14} /> {sending ? "Sending…" : "Send Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}