"use client";

import React, { useState, useEffect } from "react";
import { Article, Category, StepItem, BranchingScenario, QuickScript, DecisionNode } from "@/types/database";
import { useKnowledge } from "@/context/knowledge-context";
import {
  X,
  Save,
  Plus,
  Trash2,
  Zap,
  BookOpen,
  GitBranch,
  MessageSquare,
  Sparkles,
  Check,
  Tag,
  Clock,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";

interface ArticleEditorModalProps {
  article?: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedArticle: Article) => void;
}

export function ArticleEditorModal({
  article,
  isOpen,
  onClose,
  onSaved,
}: ArticleEditorModalProps) {
  const { categories, saveArticle } = useKnowledge();

  const [activeTab, setActiveTab] = useState<"general" | "tree" | "steps" | "branching" | "scripts" | "regulation">("general");

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [synonymsInput, setSynonymsInput] = useState("");
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [branching, setBranching] = useState<BranchingScenario[]>([]);
  const [scripts, setScripts] = useState<QuickScript[]>([]);
  const [decisionTreeJson, setDecisionTreeJson] = useState<string>("[]");
  const [decisionTreeError, setDecisionTreeError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [lastDraftTime, setLastDraftTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data on open
  useEffect(() => {
    if (isOpen) {
      if (article) {
        setTitle(article.title);
        setCategoryId(article.category_id);
        setTagsInput(article.tags_array.join(", "));
        setSynonymsInput(article.synonyms_array.join(", "));
        setSteps(article.short_steps_json || []);
        setBranching(article.branching_scenarios_json || []);
        setScripts(article.quick_scripts_json || []);
        setDecisionTreeJson(JSON.stringify(article.decision_tree_json || [], null, 2));
        setMarkdown(article.full_content_markdown || "");
      } else {
        // New article template
        setTitle("");
        setCategoryId(categories[0]?.id || "");
        setTagsInput("новый регламент, скрипт");
        setSynonymsInput("помощь, регламент");
        setSteps([
          { step: 1, title: "Идентификация клиента", desc: "Уточните номер заказа или телефон.", phrase: "Здравствуйте! Уточните номер вашего заказа." },
          { step: 2, title: "Проверка в системе", desc: "Сверьте статус в базе данных.", phrase: "Одну минуту, проверяю информацию по заказу." },
          { step: 3, title: "Решение инцидента", desc: "Озвучьте согласованный регламент клиенту.", phrase: "Вопрос решен, детали отправлены в SMS." },
        ]);
        setBranching([
          { condition: "Клиент согласен", action: "Завершите диалог с пожеланием хорошего дня.", badge_color: "green" },
          { condition: "Клиент не согласен", action: "Предложите альтернативное решение или эскалацию.", badge_color: "amber" },
        ]);
        setScripts([
          { label: "Стандартное приветствие", text: "Здравствуйте! Меня зовут Иван, служба заботы. Чем могу помочь?" },
        ]);
        setMarkdown("# Новый регламент обслуживания\n\n### 1. Общие положения\n\nОписание регламента...");
      }
      setLastDraftTime(null);
    }
  }, [isOpen, article, categories]);

  // Draft auto-save simulation
  useEffect(() => {
    if (!isOpen || !title) return;

    const timer = setTimeout(() => {
      const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      setLastDraftTime(`Черновик автосохранен в ${now}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, steps, branching, scripts, markdown, isOpen]);

  if (!isOpen) return null;

  // Add / Remove Step Handlers
  const addStep = () => {
    const nextStepNum = steps.length + 1;
    setSteps([...steps, { step: nextStepNum, title: `Шаг ${nextStepNum}`, desc: "Описание действий...", phrase: "" }]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 }));
    setSteps(updated);
  };

  // Add / Remove Branching Scenario
  const addBranching = () => {
    setBranching([...branching, { condition: "Условие (Если...)", action: "Действие (Делай...)", badge_color: "blue" }]);
  };

  const removeBranching = (index: number) => {
    setBranching(branching.filter((_, i) => i !== index));
  };

  // Add / Remove Script
  const addScript = () => {
    setScripts([...scripts, { label: "Новый скрипт", text: "Текст готовой фразы..." }]);
  };

  const removeScript = (index: number) => {
    setScripts(scripts.filter((_, i) => i !== index));
  };

  // Save Article
  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Пожалуйста, укажите название статьи", "error");
      return;
    }
    if (!categoryId) {
      showToast("Пожалуйста, выберите категорию", "error");
      return;
    }

    setIsSaving(true);

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const parsedSynonyms = synonymsInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    let parsedDecisionTree: DecisionNode[] = [];
    try {
      parsedDecisionTree = JSON.parse(decisionTreeJson || "[]");
    } catch {
      showToast("Ошибка в JSON дерева решений", "error");
      setIsSaving(false);
      return;
    }

    const payload: Partial<Article> & { title: string; category_id: string } = {
      id: article?.id,
      title: title.trim(),
      category_id: categoryId,
      short_steps_json: steps,
      branching_scenarios_json: branching,
      quick_scripts_json: scripts,
      decision_tree_json: parsedDecisionTree,
      full_content_markdown: markdown,
      tags_array: parsedTags,
      synonyms_array: parsedSynonyms,
    };

    try {
      const saved = await saveArticle(payload);
      showToast(article ? "Статья успешно обновлена!" : "Новая статья создана!");
      onSaved?.(saved);
      onClose();
    } catch {
      showToast("Ошибка при сохранении статьи", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{article ? "Редактирование статьи" : "Создание новой статьи"}</span>
            </h2>
            {lastDraftTime && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{lastDraftTime}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Сохранение..." : "Опубликовать"}
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex space-x-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Основное & Поиск
          </button>
          <button
            onClick={() => setActiveTab("tree")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "tree"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
            <span>🗺 Шагалка (Дерево диалога)</span>
          </button>
          <button
            onClick={() => setActiveTab("steps")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "steps"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Шаги алгоритма ({steps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("branching")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "branching"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-sky-500" />
            <span>Сценарии Если/То ({branching.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("scripts")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "scripts"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
            <span>Скрипты фраз ({scripts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("regulation")}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "regulation"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Полный регламент (Markdown)</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: GENERAL & SEARCH SYNONYMS */}
          {activeTab === "general" && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Заголовок статьи / Инцидента *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="напр: Задержка курьерской доставки (Заказ не доставлен в срок)"
                  className="font-semibold text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Категория базы знаний *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Теги для поиска (через запятую)
                </label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="доставка, курьер, задержка, логистика, промокод"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Синонимы для мгновенного поиска оператором</span>
                </label>
                <Input
                  value={synonymsInput}
                  onChange={(e) => setSynonymsInput(e.target.value)}
                  placeholder="привоз, водитель, машина, транспорт, когда привезут, опаздывает"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Если оператор введет любое из этих слов в поиск, статья мгновенно появится в топе выдачи.
                </p>
              </div>
            </div>
          )}

          {/* TAB: DECISION TREE */}
          {activeTab === "tree" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Интерактивное дерево решений (Naumen-стиль)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Каждый узел содержит вопрос/действие оператора, реплику скрипта и варианты ответов клиента со ссылками на следующий шаг (id).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={16}
                  value={decisionTreeJson}
                  onChange={(e) => {
                    setDecisionTreeJson(e.target.value);
                    try {
                      JSON.parse(e.target.value);
                      setDecisionTreeError(null);
                    } catch (err: unknown) {
                      setDecisionTreeError(err instanceof Error ? err.message : "Невалидный JSON");
                    }
                  }}
                  className={`w-full font-mono text-xs p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 ${
                    decisionTreeError ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                  }`}
                  placeholder="[ { id: 'start', type: 'start', text: '...', options: [...] } ]"
                />
                {decisionTreeError && (
                  <p className="text-xs text-red-500 font-medium">⚠️ Ошибка валидации JSON: {decisionTreeError}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STEPPER ALGORITHM */}
          {activeTab === "steps" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Пошаговый алгоритм отображается оператору в режиме шпаргалки (3-5 секунд).
                </p>
                <Button size="sm" variant="outline" onClick={addStep} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Добавить шаг
                </Button>
              </div>

              <div className="space-y-3">
                {steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ШАГ {st.step}
                      </span>
                      <button
                        onClick={() => removeStep(i)}
                        className="text-slate-400 hover:text-red-500"
                        title="Удалить шаг"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Название шага
                        </label>
                        <Input
                          value={st.title}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[i].title = e.target.value;
                            setSteps(updated);
                          }}
                          placeholder="Название шага"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Рекомендуемая фраза для клиента (опционально)
                        </label>
                        <Input
                          value={st.phrase || ""}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[i].phrase = e.target.value;
                            setSteps(updated);
                          }}
                          placeholder="Фраза для быстрого копирования"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Описание действия оператора
                      </label>
                      <textarea
                        value={st.desc}
                        onChange={(e) => {
                          const updated = [...steps];
                          updated[i].desc = e.target.value;
                          setSteps(updated);
                        }}
                        rows={2}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Подробное руководство к действию..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BRANCHING SCENARIOS */}
          {activeTab === "branching" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {'Блок развилок «Если клиент говорит А → делай Б» для быстрого ориентирования.'}
                </p>
                <Button size="sm" variant="outline" onClick={addBranching} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Добавить ситуацию
                </Button>
              </div>

              <div className="space-y-3">
                {branching.map((b, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Ситуация #{i + 1}</span>
                        <select
                          value={b.badge_color || "blue"}
                          onChange={(e) => {
                            const updated = [...branching];
                            updated[i].badge_color = e.target.value as any;
                            setBranching(updated);
                          }}
                          className="text-xs border rounded p-1 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        >
                          <option value="red">Красный (Критично)</option>
                          <option value="amber">Оранжевый (Внимание)</option>
                          <option value="blue">Синий (Инфо)</option>
                          <option value="green">Зеленый (Успех)</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeBranching(i)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        ЕСЛИ КЛИЕНТ ГОВОРИТ / УСЛОВИЕ:
                      </label>
                      <Input
                        value={b.condition}
                        onChange={(e) => {
                          const updated = [...branching];
                          updated[i].condition = e.target.value;
                          setBranching(updated);
                        }}
                        placeholder="напр: Курьер не выходит на связь более 10 минут"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        ДЕЙСТВИЕ ОПЕРАТОРА:
                      </label>
                      <textarea
                        value={b.action}
                        onChange={(e) => {
                          const updated = [...branching];
                          updated[i].action = e.target.value;
                          setBranching(updated);
                        }}
                        rows={2}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Что оператор должен предпринять в CRM или сказать..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUICK SCRIPTS */}
          {activeTab === "scripts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Готовые реплики, которые оператор может скопировать в буфер в 1 клик.
                </p>
                <Button size="sm" variant="outline" onClick={addScript} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Добавить фразу
                </Button>
              </div>

              <div className="space-y-3">
                {scripts.map((sc, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Input
                        value={sc.label}
                        onChange={(e) => {
                          const updated = [...scripts];
                          updated[i].label = e.target.value;
                          setScripts(updated);
                        }}
                        placeholder="Название скрипта (напр: Приветствие)"
                        className="max-w-xs font-semibold text-xs"
                      />
                      <button
                        onClick={() => removeScript(i)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <textarea
                        value={sc.text}
                        onChange={(e) => {
                          const updated = [...scripts];
                          updated[i].text = e.target.value;
                          setScripts(updated);
                        }}
                        rows={3}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Точный текст скрипта..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REGULATION MARKDOWN */}
          {activeTab === "regulation" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Быстрые вставки:</span>
                <button
                  type="button"
                  onClick={() => setMarkdown((prev) => `${prev}\n\n> **Важно:** Текст важного примечания...`)}
                  className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                >
                  + Коллаут Важно
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMarkdown(
                      (prev) =>
                        `${prev}\n\n| Услуга | Срок | Стоимость |\n| :--- | :--- | :--- |\n| Экспресс | 2 часа | 500 ₽ |`
                    )
                  }
                  className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
                >
                  <Table className="w-3 h-3" />
                  <span>+ Таблица</span>
                </button>
              </div>

              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                placeholder="# Полный регламент процесса..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
