import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, LogOut } from "lucide-react";
import { useScrollLock } from "../hooks/useScrollLock";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

let toastId = 0;

const typeStyles = {
  success: {
    Icon: CheckCircle2,
    iconColor: "text-[#16A34A]",
    barColor: "bg-[#16A34A]",
    card: "bg-white border-[#BBF7D0]",
  },
  error: {
    Icon: AlertCircle,
    iconColor: "text-[#DC2626]",
    barColor: "bg-[#DC2626]",
    card: "bg-white border-[#FECACA]",
  },
  info: {
    Icon: Info,
    iconColor: "text-[#6D3DF5]",
    barColor: "bg-[#6D3DF5]",
    card: "bg-white border-[#E9E1FF]",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  useScrollLock(Boolean(confirmState));
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (type, message, duration = 4000) => {
      if (!message) return;
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = React.useMemo(
    () => ({
      success: (message, duration) => push("success", message, duration),
      error: (message, duration) => push("error", message, duration),
      info: (message, duration) => push("info", message, duration),
      dismiss,
      confirm: ({
        title = "Are you sure?",
        message = "",
        confirmText = "Confirm",
        cancelText = "Cancel",
        danger = false,
      } = {}) =>
        new Promise((resolve) => {
          setConfirmState({
            title,
            message,
            confirmText,
            cancelText,
            danger,
            resolve,
          });
        }),
    }),
    [push, dismiss]
  );

  const resolveConfirm = useCallback(
    (value) => {
      setConfirmState((prev) => {
        if (prev) prev.resolve(value);
        return null;
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => resolveConfirm(false)}
              className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-[2px] touch-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              role="alertdialog"
              aria-modal="true"
              className="relative w-full max-w-sm bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_24px_64px_rgba(15,23,42,0.22)] p-6 text-center overscroll-contain"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  confirmState.danger
                    ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                    : "bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF]"
                }`}
              >
                <LogOut size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                {confirmState.title}
              </h3>
              {confirmState.message && (
                <p className="mt-1.5 text-sm text-[#64748B] leading-relaxed">
                  {confirmState.message}
                </p>
              )}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => resolveConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all"
                >
                  {confirmState.cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => resolveConfirm(true)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-xs ${
                    confirmState.danger
                      ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                      : "bg-[#6D3DF5] hover:bg-[#5B2FD6]"
                  }`}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[calc(100vw-2.5rem)] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = typeStyles[t.type] || typeStyles.info;
            const { Icon } = style;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${style.card} shadow-[0_12px_32px_rgba(15,23,42,0.14)]`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.barColor}`} />
                <div className="flex items-start gap-2.5 pl-4 pr-3 py-3">
                  <Icon size={18} className={`${style.iconColor} shrink-0 mt-px`} />
                  <p className="flex-1 text-xs sm:text-sm font-semibold text-[#0F172A] leading-relaxed break-words [overflow-wrap:anywhere]">
                    {t.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="p-1 -m-0.5 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
