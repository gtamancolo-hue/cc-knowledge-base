"use client";

import React, { useState, useCallback } from "react";
import { Article, DecisionNode, DecisionOption } from "@/types/database";
import {
  MessageSquare,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";

interface DecisionTreeViewProps {
  article: Article;
}

type HistoryEntry = { nodeId: string; choiceLabel?: string };

function getNodeById(nodes: DecisionNode[], id: string): DecisionNode | undefined {
  return nodes.find((n) => n.id === id);
}

function getStartNode(nodes: DecisionNode[]): DecisionNode | undefined {
  return nodes.find((n) => n.type === "start") ?? nodes[0];
}

// ── Node type config ────────────────────────────────────────────────────────
const nodeConfig: Record<
  string,
  { icon: React.ReactNode; headerClass: string; label: string }
> = {
  start: {
    icon: <Zap className="w-4 h-4" />,
    headerClass: "bg-indigo-600 text-white",
    label: "Начало",
  },
  question: {
    icon: <MessageSquare className="w-4 h-4" />,
    headerClass: "bg-sky-600 text-white",
    label: "Вопрос клиенту",
  },
  action: {
    icon: <ChevronRight className="w-4 h-4" />,
    headerClass: "bg-emerald-600 text-white",
    label: "Действие оператора",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    headerClass: "bg-amber-500 text-white",
    label: "Важная информация",
  },
  end: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    headerClass: "bg-slate-700 dark:bg-slate-600 text-white",
    label: "Завершение",
  },
};

// ── Option button variant styles ────────────────────────────────────────────
const optionVariantClass: Record<string, string> = {
  default:
    "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:shadow-md text-slate-800 dark:text-slate-100",
  destructive:
    "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 hover:border-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-800 dark:text-red-200",
  success:
    "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200",
  warning:
    "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-200",
};

export function DecisionTreeView({ article }: DecisionTreeViewProps) {
  const nodes = article.decision_tree_json ?? [];
  const startNode = getStartNode(nodes);

  const [history, setHistory] = useState<HistoryEntry[]>(
    startNode ? [{ nodeId: startNode.id }] : []
  );
  const [copiedScript, setCopiedScript] = useState(false);

  const currentEntry = history[history.length - 1];
  const currentNode = currentEntry ? getNodeById(nodes, currentEntry.nodeId) : undefined;

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleOptionClick = useCallback(
    (option: DecisionOption) => {
      const nextNode = getNodeById(nodes, option.next);
      if (!nextNode) return;
      setHistory((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], choiceLabel: option.label },
        { nodeId: nextNode.id },
      ]);
    },
    [nodes]
  );

  const handleNext = useCallback(
    (nextId: string) => {
      const nextNode = getNodeById(nodes, nextId);
      if (!nextNode) return;
      setHistory((prev) => [...prev, { nodeId: nextNode.id }]);
    },
    [nodes]
  );

  const handleBack = useCallback(() => {
    if (history.length <= 1) return;
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const handleReset = useCallback(() => {
    if (startNode) setHistory([{ nodeId: startNode.id }]);
  }, [startNode]);

  const handleCopyScript = useCallback((text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedScript(true);
      showToast("Фраза скопирована в буфер обмена!");
      setTimeout(() => setCopiedScript(false), 2000);
    }
  }, []);

  if (!nodes.length || !currentNode) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Дерево диалога не настроено для этой статьи</p>
        <p className="text-xs text-slate-500">
          Перейдите в режим «Регламент» для просмотра полного описания.
        </p>
      </div>
    );
  }

  const cfg = nodeConfig[currentNode.type] ?? nodeConfig.action;
  const isFirst = history.length <= 1;
  const isEnd = currentNode.type === "end";
  const totalSteps = history.length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Breadcrumb path ──────────────────────────────────────────────── */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          <Home className="w-3 h-3" />
          Начало
        </button>
        {history.slice(0, -1).map((entry, idx) => {
          const node = getNodeById(nodes, entry.nodeId);
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="max-w-[140px] truncate">{node?.title ?? node?.text?.slice(0, 30)}</span>
              {entry.choiceLabel && (
                <>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  <span className="italic text-slate-400 max-w-[120px] truncate">
                    «{entry.choiceLabel}»
                  </span>
                </>
              )}
            </React.Fragment>
          );
        })}
        {history.length > 1 && <ChevronRight className="w-3 h-3 shrink-0" />}
        <span className="font-semibold text-slate-700 dark:text-slate-200 max-w-[140px] truncate">
          {currentNode.title ?? currentNode.text?.slice(0, 30)}
        </span>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{
              width: isEnd
                ? "100%"
                : `${Math.min(((totalSteps - 1) / Math.max(nodes.length * 0.5, 1)) * 100, 90)}%`,
            }}
          />
        </div>
        <span className="text-xs font-medium text-slate-500 shrink-0">
          Шаг {totalSteps}
        </span>
      </div>

      {/* ── Current node card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Card header */}
        <div className={`flex items-center gap-2 px-5 py-3 ${cfg.headerClass}`}>
          {cfg.icon}
          <span className="text-xs font-bold uppercase tracking-widest opacity-90">
            {cfg.label}
          </span>
          {currentNode.title && (
            <span className="ml-auto text-xs opacity-75 font-medium truncate max-w-[200px]">
              {currentNode.title}
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="bg-white dark:bg-slate-900 px-5 py-5 space-y-4">
          {/* Main text */}
          <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentNode.text}
          </p>

          {/* Script phrase (copyable) */}
          {currentNode.script && (
            <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    💬 Скрипт оператора:
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    «{currentNode.script}»
                  </p>
                </div>
                <button
                  onClick={() => handleCopyScript(currentNode.script!)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Internal note */}
          {currentNode.note && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                {currentNode.note}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Answer options (question nodes) ──────────────────────────────── */}
      {currentNode.type === "question" && currentNode.options && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Ответ клиента:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentNode.options.map((opt, idx) => {
              const variantClass =
                optionVariantClass[opt.variant ?? "default"] ??
                optionVariantClass.default;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  className={`group relative flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left font-medium text-sm shadow-xs hover:shadow-md ${variantClass}`}
                >
                  <span className="flex-1 leading-snug">{opt.label}</span>
                  {opt.badge && (
                    <span className="shrink-0 text-[10px] font-bold bg-white/70 dark:bg-black/20 px-1.5 py-0.5 rounded-full border border-current opacity-70">
                      {opt.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Single "Next" button (action / info / start nodes) ───────────── */}
      {(currentNode.type === "action" ||
        currentNode.type === "info" ||
        currentNode.type === "start") &&
        currentNode.next && (
          <Button
            onClick={() => handleNext(currentNode.next!)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Далее
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}

      {/* ── End node actions ─────────────────────────────────────────────── */}
      {isEnd && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 flex-1">
            Диалог завершён. Зафиксируйте итог в CRM и завершите обращение.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="shrink-0 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Начать заново
          </Button>
        </div>
      )}

      {/* ── Back / Reset controls ─────────────────────────────────────────── */}
      {!isFirst && !isEnd && (
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Назад
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            В начало
          </button>
        </div>
      )}
    </div>
  );
}
