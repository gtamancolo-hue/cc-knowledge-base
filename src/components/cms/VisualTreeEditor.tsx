"use client";

import React, { useState } from "react";
import { DecisionNode, DecisionOption, DecisionNodeType } from "@/types/database";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Zap,
  ArrowRight,
  Info,
  CheckCircle2,
  CornerDownRight,
  Edit2,
  Copy,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VisualTreeEditorProps {
  nodes: DecisionNode[];
  onChange: (updatedNodes: DecisionNode[]) => void;
}

const nodeTypeBadge: Record<
  DecisionNodeType,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  start: {
    label: "Старт",
    bg: "bg-indigo-100 dark:bg-indigo-950/60",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: <Zap className="w-3 h-3" />,
  },
  question: {
    label: "Вопрос с вариантами",
    bg: "bg-sky-100 dark:bg-sky-950/60",
    text: "text-sky-700 dark:text-sky-300",
    icon: <MessageSquare className="w-3 h-3" />,
  },
  action: {
    label: "Действие оператора",
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: <ArrowRight className="w-3 h-3" />,
  },
  info: {
    label: "Инфо/Предупреждение",
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
    icon: <Info className="w-3 h-3" />,
  },
  end: {
    label: "Финал сценария",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export function VisualTreeEditor({ nodes, onChange }: VisualTreeEditorProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id || "start"
  );
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const updateNode = (id: string, partial: Partial<DecisionNode>) => {
    const next = nodes.map((n) => (n.id === id ? { ...n, ...partial } : n));
    onChange(next);
  };

  const addNode = (type: DecisionNodeType = "question") => {
    const newId = `node_${Date.now()}`;
    const newNode: DecisionNode = {
      id: newId,
      type,
      title: type === "question" ? "Новый вопрос" : "Новый шаг",
      text: type === "question" ? "Спросите клиента..." : "Инструкция для оператора...",
      options:
        type === "question"
          ? [
              { label: "Вариант 1 (Да)", next: "end" },
              { label: "Вариант 2 (Нет)", next: "end" },
            ]
          : undefined,
      next: type !== "question" && type !== "end" ? "end" : undefined,
    };
    onChange([...nodes, newNode]);
    setSelectedNodeId(newId);
  };

  const deleteNode = (id: string) => {
    if (nodes.length <= 1) return;
    const next = nodes.filter((n) => n.id !== id);
    onChange(next);
    if (selectedNodeId === id) {
      setSelectedNodeId(next[0]?.id || "");
    }
  };

  const addOption = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;
    const currentOptions = target.options || [];
    const newOption: DecisionOption = {
      label: `Ответ ${currentOptions.length + 1}`,
      next: nodes.find((n) => n.id !== nodeId)?.id || "end",
      variant: "default",
    };
    updateNode(nodeId, { options: [...currentOptions, newOption] });
  };

  const updateOption = (
    nodeId: string,
    index: number,
    partial: Partial<DecisionOption>
  ) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target || !target.options) return;
    const nextOptions = target.options.map((opt, i) =>
      i === index ? { ...opt, ...partial } : opt
    );
    updateNode(nodeId, { options: nextOptions });
  };

  const removeOption = (nodeId: string, index: number) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target || !target.options) return;
    updateNode(nodeId, {
      options: target.options.filter((_, i) => i !== index),
    });
  };

  // Switch to JSON mode
  const handleToggleJson = () => {
    if (viewMode === "visual") {
      setRawJson(JSON.stringify(nodes, null, 2));
      setJsonError(null);
      setViewMode("json");
    } else {
      try {
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed)) {
          onChange(parsed);
          setJsonError(null);
          setViewMode("visual");
        } else {
          setJsonError("JSON должен быть массивом узлов []");
        }
      } catch (err: unknown) {
        setJsonError(err instanceof Error ? err.message : "Невалидный JSON");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Визуальный конструктор дерева решений
          </h4>
          <p className="text-xs text-slate-500">
            Кликните на узел слева для редактирования текста, скрипта и стрелок переходов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleJson}
            className="text-xs"
          >
            {viewMode === "visual" ? "Режим JSON (код)" : "Визуальный режим"}
          </Button>
          {viewMode === "visual" && (
            <Button
              size="sm"
              onClick={() => addNode("question")}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Добавить узел
            </Button>
          )}
        </div>
      </div>

      {viewMode === "json" ? (
        <div className="space-y-2">
          <textarea
            rows={18}
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
          />
          {jsonError && (
            <p className="text-xs text-red-500 font-medium">⚠️ {jsonError}</p>
          )}
        </div>
      ) : (
        /* Visual 2-Column Builder */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Left: Interactive Tree List */}
          <div className="md:col-span-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
              Узлы сценария ({nodes.length})
            </div>
            {nodes.map((node, idx) => {
              const isSelected = node.id === selectedNode?.id;
              const badge = nodeTypeBadge[node.type] || nodeTypeBadge.action;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer select-none space-y-2 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{node.id}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {node.title || node.text}
                  </div>

                  {/* Branches preview */}
                  {node.type === "question" && node.options && (
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      {node.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400"
                        >
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
                            {opt.label}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-950/80 px-1 rounded">
                            → {opt.next}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {node.next && node.type !== "question" && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>Далее переходит на: </span>
                      <span className="font-mono text-indigo-500">{node.next}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Selected Node Properties Editor */}
          {selectedNode ? (
            <div className="md:col-span-7 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Редактирование узла:
                  </span>
                  <span className="font-mono text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {selectedNode.id}
                  </span>
                </div>
                {nodes.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNode(selectedNode.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-7 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Удалить
                  </Button>
                )}
              </div>

              {/* Node Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Тип карточки:
                  </label>
                  <select
                    value={selectedNode.type}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        type: e.target.value as DecisionNodeType,
                        options:
                          e.target.value === "question" && !selectedNode.options
                            ? [{ label: "Да", next: "end" }]
                            : selectedNode.options,
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="question">Вопрос клиенту (с кнопками ответов)</option>
                    <option value="action">Действие оператора</option>
                    <option value="start">Стартовый шаг</option>
                    <option value="info">Информационная подсказка</option>
                    <option value="end">Финал сценария</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Краткий заголовок:
                  </label>
                  <Input
                    value={selectedNode.title || ""}
                    onChange={(e) =>
                      updateNode(selectedNode.id, { title: e.target.value })
                    }
                    placeholder="Например: Статус курьера"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Main Text / Question */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  {selectedNode.type === "question"
                    ? "Вопрос для клиента / ситуация:"
                    : "Инструкция для оператора:"}
                </label>
                <textarea
                  rows={2}
                  value={selectedNode.text}
                  onChange={(e) =>
                    updateNode(selectedNode.id, { text: e.target.value })
                  }
                  placeholder="Текст вопроса или инструкции..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Script phrase (copyable) */}
              <div>
                <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Готовая реплика (скрипт в 1 клик):
                </label>
                <textarea
                  rows={2}
                  value={selectedNode.script || ""}
                  onChange={(e) =>
                    updateNode(selectedNode.id, { script: e.target.value })
                  }
                  placeholder="Точная фраза, которую оператор говорит вслух клиенту..."
                  className="w-full text-xs p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* Branching Answers Editor (if Question) */}
              {selectedNode.type === "question" && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Варианты ответа клиента (кнопки):
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addOption(selectedNode.id)}
                      className="text-xs h-7 px-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Добавить ответ
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(selectedNode.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            value={opt.label}
                            onChange={(e) =>
                              updateOption(selectedNode.id, oIdx, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Текст на кнопке ответа..."
                            className="text-xs h-8 flex-1"
                          />
                          <select
                            value={opt.variant || "default"}
                            onChange={(e) =>
                              updateOption(selectedNode.id, oIdx, {
                                variant: e.target.value as any,
                              })
                            }
                            className="text-xs h-8 p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            <option value="default">Серый</option>
                            <option value="success">Зеленый</option>
                            <option value="destructive">Красный</option>
                            <option value="warning">Желтый</option>
                          </select>
                          <button
                            onClick={() => removeOption(selectedNode.id, oIdx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Transition link */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 text-[11px] shrink-0">
                            → Куда переходит:
                          </span>
                          <select
                            value={opt.next}
                            onChange={(e) =>
                              updateOption(selectedNode.id, oIdx, {
                                next: e.target.value,
                              })
                            }
                            className="text-xs p-1 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-medium flex-1"
                          >
                            {nodes.map((n) => (
                              <option key={n.id} value={n.id}>
                                #{n.id} — {n.title || n.text.slice(0, 30)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Next Step (for Action / Start / Info) */}
              {selectedNode.type !== "question" &&
                selectedNode.type !== "end" && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Следующий шаг (кнопка «Далее»):
                    </span>
                    <select
                      value={selectedNode.next || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, { next: e.target.value })
                      }
                      className="text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-medium flex-1"
                    >
                      {nodes
                        .filter((n) => n.id !== selectedNode.id)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            #{n.id} — {n.title || n.text.slice(0, 30)}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
