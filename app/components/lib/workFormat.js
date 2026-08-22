// Shared formatting for Report and Question board items. Previously
// TasksView and QuestionsView each had their own inline mapping — kept
// in sync here so MyWorkView (and the History tab) can produce the
// exact same shape without duplicating/drifting from the kanban views.

import { STATUS_FROM_BACKEND } from "../data/statusMap";
import { QUESTION_STATUS_FROM_BACKEND } from "../data/questionStatusMap";

export const formatDue = (dueAt) => {
  if (!dueAt) return "—";
  const diffMs = new Date(dueAt).getTime() - Date.now();
  if (diffMs < 0) return "Overdue";
  const hrs = Math.floor(diffMs / (60 * 60 * 1000));
  if (hrs < 1) return "< 1h left";
  if (hrs < 24) return `${hrs}h left`;
  return new Date(dueAt).toLocaleDateString();
};

// Report -> TasksView/MyWorkView card shape
export const formatReportTask = (report) => ({
  id: report._id,
  reportId: report._id,
  client: report.leadId?.fullName || "Unknown Client",
  service: report.concern || "Astrology Report",
  planName: report.planName || "",
  due: report.dueAt || "-",
  dueAt: report.dueAt || null,
  priority: report.priority || "medium",
  who: report.assignedTo?.name || "—",
  status: STATUS_FROM_BACKEND[report.status],
  rawStatus: report.status,
  adminReview: report.adminReview,
  content: report.content,
  assignedAt: report.assignedAt || null,
  deliveredAt: report.deliveredAt || null,
  submittedAt: report.submittedAt || null,
  processingSegments: report.processingSegments || [],
  workDurationSeconds: report.workDurationSeconds || 0,
  payoutRate: report.payoutRate,
  payoutCurrency: report.payoutCurrency,
});

// Question -> QuestionsView/MyWorkView/AnswerQuestion card shape
export const formatQuestionCard = (q) => ({
  id: q._id,
  questionId: q._id,
  client: q.questionSetId?.fullName || "Unknown Client",
  planName: q.questionSetId?.planName || "",
  questionText: q.questionText,
  concern: q.concern,
  sequence: q.sequence,
  due: formatDue(q.dueAt),
  dueAt: q.dueAt || null,
  status: QUESTION_STATUS_FROM_BACKEND[q.status] || "new",
  rawStatus: q.status,
  birthDetails: q.questionSetId
    ? {
        gender: q.questionSetId.gender,
        dob: q.questionSetId.dob,
        tob: q.questionSetId.tob,
        pobCity: q.questionSetId.pobCity,
        pobCountry: q.questionSetId.pobCountry,
        currentCountry: q.questionSetId.currentCountry,
      }
    : null,
  answerText: q.answerText,
  assignedAt: q.assignedAt || null,
  firstStartedAt: q.firstStartedAt || null,
  answeredAt: q.answeredAt || null,
  deliveredAt: q.deliveredAt || null,
  workDurationSeconds: q.workDurationSeconds || 0,
  payoutRate: q.payoutRate,
  payoutCurrency: q.payoutCurrency,
});

// mm:ss / h m formatting for a duration stored in seconds.
export const formatDuration = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  if (s === 0) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0 && m === 0) return "< 1m";
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatMoney = (amount, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${Math.round(amount || 0)}`;
};
