"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import axiosInstanceClient from "../services/client.services";

const NotificationContext = createContext(null);

const STORAGE_KEY = "cr-notifications";
const MAX_STORED = 50;

let notifId = 0;

const loadStored = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStored = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_STORED)));
  } catch {
    // storage full/unavailable — non-fatal
  }
};

// A short, synthesized two-tone chime via the Web Audio API — no audio
// file to ship, host, or have go 404 in production. Built lazily and
// reused so repeated notifications don't leak AudioContext instances
// (browsers cap how many can be created).
let audioCtx = null;

const playChime = () => {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    [880, 1175].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {
    // Audio isn't essential — a failure here should never break notifications.
  }
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  // "New since last viewed" counters for the Report Tasks and Questions
  // sidebar badges — incremented on the matching SSE event, zeroed out
  // by resetReportsBadge()/resetQuestionsBadge() when the astrologer
  // actually opens that tab (see Sidebar.jsx). Deliberately NOT derived
  // from server data (unlike the Inbox unread count) — there's no
  // "seen" flag on reports/questions server-side, so this is purely a
  // "what showed up since I last looked at this tab" client counter.
  const [reportsBadge, setReportsBadge] = useState(0);
  const [questionsBadge, setQuestionsBadge] = useState(0);
  const esRef = useRef(null);

  useEffect(() => {
    setNotifications(loadStored());
  }, []);

  const resetReportsBadge = useCallback(() => setReportsBadge(0), []);
  const resetQuestionsBadge = useCallback(() => setQuestionsBadge(0), []);

  const addNotification = useCallback((type, title, body, { sound = false } = {}) => {
    setNotifications((prev) => {
      const next = [
        {
          id: `${Date.now()}-${++notifId}`,
          type,
          title,
          body,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ].slice(0, MAX_STORED);
      saveStored(next);
      return next;
    });

    if (sound) playChime();
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveStored(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveStored(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("astrologerToken");
    if (!token) return;

    const streamUrl = `${axiosInstanceClient.defaults.baseURL}/astrologer/stream?token=${token}`;
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.addEventListener("new-task-assigned", (event) => {
      let report = {};
      try {
        report = JSON.parse(event.data);
      } catch {
        return;
      }

      const clientName = report.leadId?.fullName || report.concern || "a client";

      if (report.adminReview?.status === "rejected") {
        addNotification(
          "revision",
          "Revision requested",
          `Admin sent back the report for ${clientName}${
            report.adminReview.reviewNote ? `: "${report.adminReview.reviewNote}"` : ""
          }`,
          { sound: true },
        );
      } else {
        addNotification(
          "assignment",
          "New task assigned",
          `You've been assigned a new report for ${clientName}.`,
          { sound: true },
        );
      }

      setReportsBadge((n) => n + 1);
    });

    // Was nested INSIDE the "new-task-assigned" callback above — which
    // meant this listener only ever got registered after a report task
    // fired at least once. An astrologer who only ever received
    // questions (no report tasks) would never have this listener
    // attached at all, so question-assignment notifications silently
    // never fired. Moved out to a sibling listener, registered
    // unconditionally alongside the others.
    es.addEventListener("new-question-assigned", () => {
      addNotification(
        "assignment",
        "New question assigned",
        "A client has a new question waiting for your reply.",
        { sound: true },
      );

      setQuestionsBadge((n) => n + 1);
    });

    es.addEventListener("report-delivered", (event) => {
      let report = {};
      try {
        report = JSON.parse(event.data);
      } catch {
        return;
      }

      const clientName = report.leadId?.fullName || report.concern || "a client";

      addNotification(
        "delivered",
        "Report delivered",
        `Your report for ${clientName} was approved and delivered to the client.`,
      );
    });

    es.onerror = () => {
      // EventSource auto-reconnects on its own; this just avoids an
      // unhandled-error console spam on transient network drops.
    };

    return () => es.close();
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        reportsBadge,
        questionsBadge,
        resetReportsBadge,
        resetQuestionsBadge,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside <NotificationProvider>. Wrap your root layout with it.",
    );
  }
  return ctx;
}