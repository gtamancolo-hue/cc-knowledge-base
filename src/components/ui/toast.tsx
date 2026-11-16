"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "info" | "error";
  text: string;
}

let toastListeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(text: string, type: "success" | "info" | "error" = "success") {
  const msg: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random()}`,
    type,
    text,
  };
  toastListeners.forEach((fn) => fn(msg));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 2500);
    };

    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border pointer-events-auto animate-fade-in ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:border-white"
              : toast.type === "error"
              ? "bg-red-600 text-white border-red-500"
              : "bg-indigo-600 text-white border-indigo-500"
          }`}
        >
          {toast.type === "success" && <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.type === "info" && <Copy className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
