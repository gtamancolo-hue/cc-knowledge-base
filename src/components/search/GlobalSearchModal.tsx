"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useKnowledge } from "@/context/knowledge-context";
import { searchKnowledgeBase, SearchResultItem } from "@/lib/search/fuse-search";
import {
  Search,
  X,
  FileText,
  Zap,
  Tag,
  ArrowRight,
  Folder,
  Sparkles,
  CornerDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function GlobalSearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen, articles, categories, synonyms } = useKnowledge();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<"all" | "cheatsheet" | "regulation">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setSelectedCategory(null);
    }
  }, [isSearchOpen]);

  // Execute fuzzy search with synonym expansion
  const results: SearchResultItem[] = query.trim().length >= 2
    ? searchKnowledgeBase(
        articles,
        query,
        {
          categoryId: selectedCategory,
          contentType: selectedContentType,
        },
        synonyms
      )
    : [];

  // Keyboard navigation inside search results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;

      if (e.key === "Escape") {
        setIsSearchOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        navigateToArticle(results[selectedIndex].article.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, results, selectedIndex]);

  const navigateToArticle = (articleId: string) => {
    setIsSearchOpen(false);
    router.push(`/articles/${articleId}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Введите запрос, синоним или фразу (напр: манибэк, курьер, бой, эскалация)..."
            className="w-full bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            ESC
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Фильтр:</span>

          {/* Content Type Toggle */}
          <div className="flex items-center space-x-1 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg">
            <button
              onClick={() => setSelectedContentType("all")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                selectedContentType === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setSelectedContentType("cheatsheet")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                selectedContentType === "cheatsheet"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Шпаргалки</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Все категории
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors truncate max-w-[140px] ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {query.trim().length < 2 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Начните вводить от 2-х символов для мгновенного поиска</p>
              <p className="text-xs text-slate-500 mt-1">
                Поддерживаются опечатки, словари синонимов и поиск по фразам скрипта
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">По запросу «{query}» ничего не найдено</p>
              <p className="text-xs text-slate-500 mt-1">
                Попробуйте обобщить термин или очистить фильтр категории
              </p>
            </div>
          ) : (
            results.map((res, index) => {
              const isSelected = index === selectedIndex;
              const cat = categories.find((c) => c.id === res.article.category_id);

              return (
                <div
                  key={res.article.id}
                  onClick={() => navigateToArticle(res.article.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                          {res.article.title}
                        </span>
                        {res.article.short_steps_json.length > 0 && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            <Zap className="w-2.5 h-2.5 mr-0.5 fill-amber-500" />
                            Шпаргалка
                          </Badge>
                        )}
                      </div>

                      {/* Synonyms Match Badge */}
                      {res.matchedSynonym && (
                        <div className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            Сработало сопоставление синонимов: «{res.matchedSynonym.searchedTerm}» → «{res.matchedSynonym.canonicalKey}»
                          </span>
                        </div>
                      )}

                      {/* Snippet / Step summary */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {res.article.short_steps_json.map((s) => `Шаг ${s.step}: ${s.title}`).join(" • ")}
                      </p>

                      {/* Tags & Category */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {cat && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {cat.name}
                          </span>
                        )}
                        {res.article.tags_array.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] text-slate-400 dark:text-slate-500"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-slate-400 shrink-0 self-center">
                      <CornerDownLeft className="w-4 h-4 opacity-70" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span>↑↓ Навигация</span>
            <span>↵ Открыть</span>
            <span>ESC Закрыть</span>
          </div>
          <span>Найдено: {results.length}</span>
        </div>
      </div>
    </div>
  );
}
