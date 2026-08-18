"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

/* =========================
   Toast Icons
========================= */

const ICON = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

/* =========================
   Toast Colors
========================= */

const COLOR = {
  success: "var(--success)",
  warning: "#b8860b",
  error: "var(--danger)",
};

let toastId = 0;

/* =========================
   Toast Provider
========================= */

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  /* =========================
     Dismiss Toast
  ========================= */

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  /* =========================
     Push Toast
  ========================= */

  const push = useCallback(
    (message, type = "success", duration = 3500) => {
      const id = ++toastId;

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ]);

      if (duration > 0) {
        timers.current[id] = setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss],
  );

  /* =========================
     Toast API
  ========================= */

  const api = {
    success: (message) => {
      return push(message, "success");
    },

    warning: (message) => {
      return push(message, "warning");
    },

    error: (message) => {
      return push(message, "error");
    },

    dismiss,
  };

  /* =========================
     Render
  ========================= */

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="cr-toast-viewport cr-toast-viewport--top-right">
        {toasts.map((toast) => {
          const Icon = ICON[toast.type];

          return (
            <div
              key={toast.id}
              className={`cr-toast cr-toast--${toast.type}`}
              role="status"
              onClick={() => dismiss(toast.id)}
            >
              {/* Icon */}
              <Icon
                size={17}
                color={COLOR[toast.type]}
                style={{ flexShrink: 0 }}
              />

              {/* Message */}
              <span className="cr-toast-msg">{toast.message}</span>

              {/* Close Button */}
              <button
                type="button"
                className="cr-toast-close"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/* =========================
   useToast Hook
========================= */

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error(
      "useToast must be used inside <ToastProvider>. Wrap your root layout with it.",
    );
  }

  return ctx;
}
