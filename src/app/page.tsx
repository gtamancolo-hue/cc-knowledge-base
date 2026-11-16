"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useKnowledge } from "@/context/knowledge-context";
import {
  Search,
  Zap,
  Flame,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  Headphones,
  CheckCircle,
  Folder,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsFeed } from "@/components/news/NewsFeed";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    articles,
    categories,
    mostVisitedArticles,
    recentArticles,
    favorites,
    isFavorite,
    toggleFavorite,
    setIsSearchOpen,
  } = useKnowledge();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Shift Greeting & Fast Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-semibold backdrop-blur-xs">
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>Смена активна • Линия 1</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Добро пожаловать, {user?.full_name ? user.full_name.split(" ")[0] : "Коллега"}!
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Мгновенный доступ к пошаговым шпаргалкам, скриптам фраз и регламентам компании.
            Для быстрого поиска на звонке нажмите <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/20 font-mono text-xs">Ctrl+K</kbd>.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm shadow-md hover:bg-indigo-50 transition-all active:scale-98"
            >
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Открыть умный поиск (Ctrl+K)</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* QUICK LAUNCH: TOP FREQUENT INCIDENTS (FAST START OF SHIFT) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Быстрый старт смены (Топ частых звонков)
              </h2>
              <p className="text-xs text-slate-500">
                Готовые пошаговые шпаргалки с реакцией за 3–5 секунд
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.slice(0, 4).map((art) => {
            const isFav = isFavorite(art.id);
            const category = categories.find((c) => c.id === art.category_id);

            return (
              <div
                key={art.id}
                className="group relative flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-600 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[150px]">
                      {category?.name || "Регламент"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(art.id);
                      }}
                      className="text-slate-400 hover:text-amber-500"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? "fill-amber-400 text-amber-500" : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  </div>

                  <Link href={`/articles/${art.id}`} className="block">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
                      {art.title}
                    </h3>

                    {art.short_steps_json.length > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                        <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                          <Zap className="w-3 h-3 fill-indigo-500" />
                          <span>{art.short_steps_json.length} шага решения</span>
                        </div>
                        <p className="line-clamp-1 italic">
                          1. {art.short_steps_json[0]?.title}
                        </p>
                      </div>
                    )}
                  </Link>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {art.views_count} обращений
                  </span>
                  <Link
                    href={`/articles/${art.id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Открыть</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TWO COLUMNS: MOST VISITED & RECENT ARTICLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Visited Articles */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Часто используемое на смене
            </h2>
          </div>

          <div className="space-y-2">
            {mostVisitedArticles.map((art) => (
              <Link
                key={art.id}
                href={`/articles/${art.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {art.views_count}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {art.title}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Viewed Articles */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Недавно просмотренные
            </h2>
          </div>

          {recentArticles.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Здесь будут отображаться открытые вами статьи для быстрого возврата к закрытой вкладке.
            </div>
          ) : (
            <div className="space-y-2">
              {recentArticles.slice(0, 5).map((art) => (
                <Link
                  key={art.id}
                  href={`/articles/${art.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {art.title}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                    Открыть →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* NEWS & UPDATES FEED */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Лента новостей и регламентов
              </h2>
              <p className="text-xs text-slate-500">
                Оперативные изменения тарифов, обновление скриптов и предупреждения о сбоях
              </p>
            </div>
          </div>
        </div>

        <NewsFeed />
      </section>
    </div>
  );
}
