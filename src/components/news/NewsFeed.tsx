"use client";

import React from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { Bell, CheckCircle2, AlertOctagon, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NewsFeed() {
  const { alerts, acknowledgeAlert } = useKnowledge();

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isUrgent = alert.priority === "urgent";
        const isRead = alert.acknowledged;

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all ${
              isUrgent && !isRead
                ? "bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 shadow-sm"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3 flex-1">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isUrgent
                      ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                  }`}
                >
                  {isUrgent ? <AlertOctagon className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`font-bold text-sm sm:text-base ${
                        isUrgent ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {alert.title}
                    </span>
                    <Badge variant={isUrgent ? "urgent" : "secondary"} className="text-[10px]">
                      {alert.tag}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {alert.content}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-1">
                    {new Date(alert.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              {isUrgent && !isRead && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ознакомлен</span>
                </button>
              )}

              {isRead && (
                <span className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Прочитано</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
