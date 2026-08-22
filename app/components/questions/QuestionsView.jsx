"use client";

import { useEffect, useState } from "react";
import { GripVertical, CalendarClock, Reply, CheckCircle2 } from "lucide-react";

import { QuestionModal } from "./QuestionModal";
import axiosInstanceClient from "../services/client.services";
import { QUESTION_STATUS_TO_BACKEND } from "../data/questionStatusMap";
import { KanbanSkeleton } from "../common/Skeleton";
import { formatQuestionCard } from "../lib/workFormat";
import { RefreshButton } from "../common/RefreshButton";
import { Eyebrow } from "../common/Eyebrow";

const columns = [
  { key: "new", label: "New" },
  { key: "progress", label: "In progress" },
  { key: "delivered", label: "Answered" },
];

const columnColors = {
  new: "var(--maroon)",
  progress: "var(--gold)",
  delivered: "var(--success)",
};

export const QuestionsView = ({ onAnswerQuestion, initialSelectedId, onInitialSelectedConsumed }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const fetchQuestions = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await axiosInstanceClient.get("/astrologer/questions");
      const board = res.data.data.board;
      const all = [...board.pending, ...board.processing, ...board.answered];

      setQuestions(all.map(formatQuestionCard));
    } catch (error) {
      console.error("Failed fetching questions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Arriving here from MyWorkView's "assigned to you" list.
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

    es.addEventListener("new-question-assigned", () => {
      fetchQuestions({ silent: true });
    });

    return () => es.close();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const backendStatus = QUESTION_STATUS_TO_BACKEND[newStatus];
    if (!backendStatus) return;

    try {
      await axiosInstanceClient.patch(`/astrologer/questions/${id}/status`, {
        status: backendStatus,
      });

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, status: newStatus, rawStatus: backendStatus }
            : q,
        ),
      );
    } catch (error) {
      console.error("Question status update failed:", error);
    }
  };

  const onDrop = (e, colKey) => {
    e.preventDefault();

    const id = e.dataTransfer.getData("text/plain") || draggingId;

    // "Answered" is never reachable by dragging — only by sending the
    // actual answer (see AnswerQuestion.jsx), same as TasksView blocks
    // drops into ready/delivered.
    if (colKey === "delivered") {
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

  const selectedQuestion = questions.find((q) => q.id === selectedId) || null;

  if (loading) {
    return <KanbanSkeleton columnCount={columns.length} />;
  }

  return (
    <>
      <div className="cr-page-head-row">
        <Eyebrow>Questions</Eyebrow>
        <RefreshButton
          onClick={() => fetchQuestions({ silent: true })}
          loading={refreshing}
        />
      </div>

      <div className="cr-kanban">
        {columns.map((col) => {
        const items = questions.filter((q) => q.status === col.key);
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
              {items.map((q) => (
                <div
                  className={`cr-kcard ${draggingId === q.id ? "dragging" : ""}`}
                  key={q.id}
                  draggable={col.key !== "delivered"}
                  onDragStart={(e) => {
                    setDraggingId(q.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", q.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverCol(null);
                  }}
                  onClick={() => setSelectedId(q.id)}
                >
                  <div className="cr-kcard-top">
                    <div className="cr-kclient">{q.client}</div>
                    {col.key !== "delivered" && (
                      <GripVertical size={13} color="var(--text-faint)" />
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                      marginTop: 4,
                      marginBottom: 6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {q.questionText}
                  </div>

                  <div className="cr-kmeta-row">
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                      {q.concern || q.planName || "Question"} · #{q.sequence}
                    </span>
                    {col.key !== "delivered" && (
                      <span className="cr-kdue">
                        <CalendarClock size={11} />
                        {q.due}
                      </span>
                    )}
                  </div>

                  <div className="cr-kfoot">
                    {col.key === "delivered" ? (
                      <div className="cr-kassignee">
                        <CheckCircle2 size={14} color="var(--success)" />
                        Answered
                      </div>
                    ) : (
                      <div className="cr-kassignee">
                        <Reply size={13} />
                        Awaiting your reply
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {items.length === 0 && <div className="cr-kempty">Drop here</div>}
            </div>
          </div>
        );
      })}

      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          accent={columnColors[selectedQuestion.status]}
          onClose={() => setSelectedId(null)}
          onAnswer={(question) => {
            onAnswerQuestion(question);
            setSelectedId(null);
          }}
        />
      )}
      </div>
    </>
  );
};
