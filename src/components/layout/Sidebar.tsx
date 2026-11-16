"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useKnowledge } from "@/context/knowledge-context";
import {
  BookOpen,
  Star,
  Clock,
  Truck,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Folder,
  Layers,
  Settings,
  Database,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  onCloseMobile?: () => void;
}

// Icon mapper for categories
const ICON_MAP: Record<string, React.ReactNode> = {
  Truck: <Truck className="w-4 h-4 text-emerald-500" />,
  CreditCard: <CreditCard className="w-4 h-4 text-sky-500" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-rose-500" />,
  Cpu: <Cpu className="w-4 h-4 text-purple-500" />,
};

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { role, isSupabaseLive, user } = useAuth();
  const { categories, articles, favorites, recentArticles } = useKnowledge();

  const favoriteArticles = articles.filter((a) => favorites.includes(a.id));

  return (
    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col h-full select-none">
      {/* Brand & Shift Indicator */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center space-x-2.5 font-bold text-slate-900 dark:text-white hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="leading-tight text-sm font-bold">КЦ База Знаний</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              Контакт-центр 24/7
            </div>
          </div>
        </Link>

        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSupabaseLive ? "bg-emerald-500 ring-4 ring-emerald-500/20" : "bg-sky-500 ring-4 ring-sky-500/20"
          }`}
          title={isSupabaseLive ? "Подключен к Supabase (RLS)" : "Автономный Demo режим"}
        />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-sm">
        {/* Core Shift Links */}
        <div className="space-y-1">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === "/"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Панель смены</span>
          </Link>
        </div>

        {/* Favorites section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Избранное</span>
            </span>
            <span className="text-[11px] font-mono">{favoriteArticles.length}</span>
          </div>

          {favoriteArticles.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-slate-400 italic">
              Отмечайте шпаргалки звёздочкой для быстрого вызова на звонке
            </p>
          ) : (
            <div className="space-y-0.5">
              {favoriteArticles.map((art) => (
                <Link
                  key={art.id}
                  href={`/articles/${art.id}`}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors truncate ${
                    pathname === `/articles/${art.id}`
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span className="truncate">{art.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Categories Tree */}
        <div>
          <div className="px-3 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Категории регламентов
          </div>
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const count = articles.filter((a) => a.category_id === cat.id).length;
              const isActive = pathname === `/categories/${cat.slug}`;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {ICON_MAP[cat.icon] || <Folder className="w-4 h-4 text-slate-400" />}
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recently viewed section */}
        {recentArticles.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 px-3 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Недавние статьи</span>
            </div>
            <div className="space-y-0.5">
              {recentArticles.slice(0, 4).map((art) => (
                <Link
                  key={art.id}
                  href={`/articles/${art.id}`}
                  onClick={onCloseMobile}
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs transition-colors truncate ${
                    pathname === `/articles/${art.id}`
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/40 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className="truncate">{art.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Admin CMS Section */}
        {role === "admin" && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 mb-1 text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center justify-between">
              <span>Панель CMS</span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Админ
              </Badge>
            </div>
            <div className="space-y-1">
              <Link
                href="/cms"
                onClick={onCloseMobile}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === "/cms"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
                }`}
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Управление базой знаний</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span>Пользователь:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
            {user?.full_name || "Оператор"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>СУБД / Auth:</span>
          <span className="font-mono">
            {isSupabaseLive ? "Supabase (RLS)" : "Demo Storage"}
          </span>
        </div>
      </div>
    </aside>
  );
}
