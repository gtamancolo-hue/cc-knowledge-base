"use client";

import React from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { AlertOctagon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UrgentAlertBanner() {
  const { urgentAlerts, acknowledgeAlert } = useKnowledge();

  if (urgentAlerts.length === 0) return null;

  // Show the most recent unacknowledged urgent alert
  const currentAlert = urgentAlerts[0];

  return (
    <div className="sticky top-0 z-40 bg-red-600 dark:bg-red-700 text-white px-4 py-2.5 shadow-md border-b border-red-500 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-1.5 bg-red-700 dark:bg-red-800 rounded-md animate-pulse shrink-0">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                {currentAlert.tag || "СРОЧНЫЙ СБОЙ"}
              </span>
              <span className="font-semibold text-sm sm:text-base">
                {currentAlert.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-100 mt-0.5 line-clamp-2">
              {currentAlert.content}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          <Button
            size="sm"
            onClick={() => acknowledgeAlert(currentAlert.id)}
            className="bg-white hover:bg-red-50 text-red-700 font-bold border-0 shadow-sm text-xs px-3 py-1.5 transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-red-600" />
            Ознакомлен
          </Button>
        </div>
      </div>
    </div>
  );
}
