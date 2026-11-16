"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useKnowledge } from "@/context/knowledge-context";
import { Article, SynonymDictionary } from "@/types/database";
import {
  Settings,
  PlusCircle,
  AlertOctagon,
  Edit,
  Trash2,
  Sparkles,
  BookOpen,
  Layers,
  Search,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArticleEditorModal } from "@/components/cms/ArticleEditorModal";
import { AlertManagerModal } from "@/components/cms/AlertManagerModal";
import { showToast } from "@/components/ui/toast";
import Link from "next/link";

export default function CMSDashboardPage() {
  const { role } = useAuth();
  const {
    articles,
    categories,
    deleteArticle,
    synonyms,
    updateSynonyms,
  } = useKnowledge();

  const [activeTab, setActiveTab] = useState<"articles" | "synonyms">("articles");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Synonyms management state
  const [newKeyword, setNewKeyword] = useState("");
  const [newSynonymsList, setNewSynonymsList] = useState("");

  // Operator guard
  if (role !== "admin") {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Доступ ограничен: Требуются права Руководителя КЦ
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Вы вошли под ролью Оператора. Для переключения роли в демо-режиме воспользуйтесь переключателем в правом верхнем углу шапки.
        </p>
      </div>
    );
  }

  const filteredArticles = articles.filter((a) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return a.title.toLowerCase().includes(q);
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Вы уверены, что хотите удалить регламент «${title}»?`)) {
      await deleteArticle(id);
      showToast("Статья успешно удалена");
    }
  };

  const handleAddSynonym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newSynonymsList.trim()) return;

    const synArray = newSynonymsList
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const updated: SynonymDictionary = {
      ...synonyms,
      [newKeyword.trim().toLowerCase()]: synArray,
    };

    updateSynonyms(updated);
    setNewKeyword("");
    setNewSynonymsList("");
    showToast("Словарь синонимов обновлен!");
  };

  const handleRemoveSynonym = (key: string) => {
    const updated = { ...synonyms };
    delete updated[key];
    updateSynonyms(updated);
    showToast(`Ключ «${key}» удален из словаря синонимов`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top CMS Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              CMS Панель Руководителя
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Управление регламентами, синонимами поиска и срочными оповещениями
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setIsAlertModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
          >
            <AlertOctagon className="w-4 h-4 mr-1.5" />
            Срочный алерт
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingArticle(null);
              setIsArticleModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Создать регламент
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("articles")}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === "articles"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Статьи и шпаргалки ({articles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("synonyms")}
          className={`py-2.5 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === "synonyms"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Словарь синонимов поиска ({Object.keys(synonyms).length})</span>
        </button>
      </div>

      {/* TAB 1: ARTICLES MANAGEMENT */}
      {activeTab === "articles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Фильтр по названию статьи..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Показано: {filteredArticles.length}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3.5">Название регламента</th>
                    <th className="p-3.5">Категория</th>
                    <th className="p-3.5">Шпаргалка</th>
                    <th className="p-3.5">Просмотры</th>
                    <th className="p-3.5">Обновлено</th>
                    <th className="p-3.5 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredArticles.map((art) => {
                    const cat = categories.find((c) => c.id === art.category_id);

                    return (
                      <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          <Link href={`/articles/${art.id}`} className="hover:text-indigo-600 transition-colors">
                            {art.title}
                          </Link>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {cat?.name || "—"}
                        </td>
                        <td className="p-3.5">
                          {art.short_steps_json.length > 0 ? (
                            <Badge variant="warning" className="text-[10px]">
                              {art.short_steps_json.length} шага
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {art.views_count}
                        </td>
                        <td className="p-3.5 text-slate-500 text-xs">
                          {new Date(art.updated_at).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingArticle(art);
                              setIsArticleModalOpen(true);
                            }}
                            title="Редактировать статью"
                          >
                            <Edit className="w-4 h-4 text-indigo-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(art.id, art.title)}
                            title="Удалить статью"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYNONYM DICTIONARY MANAGEMENT */}
      {activeTab === "synonyms" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Добавить синоним в словарь операторов</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              При вводе оператором любого синонима поисковый движок Fuse.js моментально подтянет статьи с каноническим словом.
            </p>

            <form onSubmit={handleAddSynonym} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Базовое слово (напр: возврат)"
                  className="bg-white dark:bg-slate-900 text-xs sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex space-x-2">
                <Input
                  value={newSynonymsList}
                  onChange={(e) => setNewSynonymsList(e.target.value)}
                  placeholder="Синонимы через запятую: манибэк, отмена, вернуть деньги, чарджбэк"
                  className="bg-white dark:bg-slate-900 text-xs sm:text-sm flex-1"
                />
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs">
                  Добавить
                </Button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(synonyms).map(([keyword, synList]) => (
              <div
                key={keyword}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 capitalize">
                      «{keyword}»
                    </span>
                    <button
                      onClick={() => handleRemoveSynonym(keyword)}
                      className="text-slate-400 hover:text-red-500"
                      title="Удалить группу синонимов"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {synList.map((syn) => (
                      <span
                        key={syn}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <ArticleEditorModal
        article={editingArticle}
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
      />

      {/* Alert Manager Modal */}
      <AlertManagerModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
}
