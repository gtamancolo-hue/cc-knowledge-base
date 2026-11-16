"use client";

import React from "react";
import { Zap, BookOpen } from "lucide-react";

export type ArticleViewMode = "cheatsheet" | "full";

interface ModeToggleProps {
  mode: ArticleViewMode;
  onChange: (mode: ArticleViewMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 mb-6 shadow-inner">
      <button
        type="button"
        onClick={() => onChange("cheatsheet")}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all select-none ${
          mode === "cheatsheet"
            ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Zap
          className={`w-4 h-4 ${
            mode === "cheatsheet" ? "text-amber-500 dark:text-amber-300 fill-amber-500" : "text-slate-400"
          }`}
        />
        <span>⚡ Шпаргалка на звонке (3–5 сек)</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("full")}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all select-none ${
          mode === "full"
            ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <BookOpen
          className={`w-4 h-4 ${
            mode === "full" ? "text-indigo-600 dark:text-white" : "text-slate-400"
          }`}
        />
        <span>📖 Полный регламент</span>
      </button>
    </div>
  );
}
