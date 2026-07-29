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

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const esRef = useRef(null);

  useEffect(() => {
    setNotifications(loadStored());
  }, []);

  const addNotification = useCallback((type, title, body) => {
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
        );
      } else {
        addNotification(
          "assignment",
          "New task assigned",
          `You've been assigned a new report for ${clientName}.`,
        );
      }
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

    return () => es.close();
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}
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