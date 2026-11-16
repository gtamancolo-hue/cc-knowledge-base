"use client";

import React, { useState } from "react";
import { Article, StepItem, BranchingScenario, QuickScript } from "@/types/database";
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  GitBranch,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";

interface CheatSheetViewProps {
  article: Article;
}

export function CheatSheetView({ article }: CheatSheetViewProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const handleCopyScript = (text: string, index: number) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showToast("Фраза скопирована в буфер обмена!");
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const getBranchBadgeStyle = (color?: string) => {
    switch (color) {
      case "red":
        return "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20";
      case "amber":
        return "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20";
      case "green":
        return "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
      case "blue":
      default:
        return "border-l-4 border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. STEP-BY-STEP STEPPER ALGORITHM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
              1
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Пошаговый алгоритм действий оператора
            </h2>
          </div>
          {completedSteps.length > 0 && (
            <button
              onClick={() => setCompletedSteps([])}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
            >
              Сбросить отметки шагов
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {article.short_steps_json.map((stepItem: StepItem) => {
            const isCompleted = completedSteps.includes(stepItem.step);

            return (
              <div
                key={stepItem.step}
                onClick={() => toggleStep(stepItem.step)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isCompleted
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCompleted
                          ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
                          : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                      }`}
                    >
                      Шаг {stepItem.step}
                    </span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                  </div>

                  <h3
                    className={`font-bold text-base mb-1.5 leading-snug ${
                      isCompleted
                        ? "line-through text-slate-500 dark:text-slate-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {stepItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>

                {stepItem.phrase && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyScript(stepItem.phrase!, 900 + stepItem.step);
                      }}
                      className="w-full text-left flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 transition-colors group"
                    >
                      <span className="truncate italic">«{stepItem.phrase}»</span>
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. BRANCHING SCENARIOS ("ЕСЛИ КЛИЕНТ ГОВОРИТ А -> ДЕЛАЙ Б") */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
            2
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-500" />
            <span>Ветвление ситуаций (Если / То)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {article.branching_scenarios_json.map((scenario: BranchingScenario, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between ${getBranchBadgeStyle(
                scenario.badge_color
              )}`}
            >
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  ЕСЛИ КЛИЕНТ ГОВОРИТ:
                </div>
                <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3">
                  «{scenario.condition}»
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center space-x-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>ДЕЙСТВИЕ ОПЕРАТОРА:</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {scenario.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. READY-TO-USE PHRASE SCRIPTS (1-CLICK COPY) */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
            3
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <span>Готовые скрипты фраз (Копирование в 1 клик)</span>
          </h2>
        </div>

        <div className="space-y-3">
          {article.quick_scripts_json.map((script: QuickScript, index: number) => {
            const isCopied = copiedIndex === index;

            return (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {script.label}
                  </div>
                  <div className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                    «{script.text}»
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleCopyScript(script.text, index)}
                  className={`shrink-0 transition-all text-xs font-semibold ${
                    isCopied
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-white" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5 text-indigo-500" />
                      Скопировать в 1 клик
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
