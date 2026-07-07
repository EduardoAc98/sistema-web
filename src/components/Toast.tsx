import React, { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type ToastCallback = (message: string, type: ToastType) => void;
let toastListeners: ToastCallback[] = [];

export function showToast(message: string, type: ToastType = "success") {
  toastListeners.forEach((listener) => listener(message, type));
}

export const toast = {
  success: (msg: string) => showToast(msg, "success"),
  error: (msg: string) => showToast(msg, "error"),
  info: (msg: string) => showToast(msg, "info"),
  warning: (msg: string) => showToast(msg, "warning"),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewToast = (message: string, type: ToastType) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    toastListeners.push(handleNewToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleNewToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bgColor = "bg-slate-900 border-slate-800 text-white shadow-slate-950/20";
        let icon = "info";
        let iconColor = "text-blue-400";
        
        if (t.type === "success") {
          bgColor = "bg-emerald-950/95 border-emerald-800 text-emerald-50 shadow-emerald-950/20";
          icon = "check_circle";
          iconColor = "text-emerald-400";
        } else if (t.type === "error") {
          bgColor = "bg-rose-950/95 border-rose-900 text-rose-50 shadow-rose-950/20";
          icon = "error";
          iconColor = "text-rose-400";
        } else if (t.type === "warning") {
          bgColor = "bg-amber-950/95 border-amber-900 text-amber-50 shadow-amber-950/20";
          icon = "warning";
          iconColor = "text-[#ffb800]";
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${bgColor}`}
          >
            <span className={`material-symbols-outlined text-lg ${iconColor} shrink-0`}>
              {icon}
            </span>
            <p className="text-xs font-bold font-sans tracking-wide leading-relaxed flex-1">
              {t.message}
            </p>
            <button
              onClick={() => setToasts((prev) => prev.filter((to) => to.id !== t.id))}
              className="text-gray-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
