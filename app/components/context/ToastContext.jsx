"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICON = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};
const COLOR = {
  success: "var(--success)",
  error: "var(--danger)",
  warning: "#b8860b",
  info: "#4a7fb5",
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0)
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const api = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    warning: (m) => push(m, "warning"),
    info: (m) => push(m, "info"),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="cr-toast-viewport cr-toast-viewport--top-right">
        {toasts.map((t) => {
          const Icon = ICON[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`cr-toast cr-toast--${t.type}`}
              role="status"
              onClick={() => dismiss(t.id)}
            >
              <Icon size={17} color={COLOR[t.type]} style={{ flexShrink: 0 }} />
              <span className="cr-toast-msg">{t.message}</span>
              <button
                type="button"
                className="cr-toast-close"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(t.id);
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

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error(
      "useToast must be used inside <ToastProvider>. Wrap your root layout with it.",
    );
  return ctx;
}
