"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useKnowledge } from "@/context/knowledge-context";
import { useAuth } from "@/context/auth-context";
import {
  Folder,
  ArrowRight,
  Star,
  Zap,
  Eye,
  PlusCircle,
  Truck,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleEditorModal } from "@/components/cms/ArticleEditorModal";

const ICON_MAP: Record<string, React.ReactNode> = {
  Truck: <Truck className="w-6 h-6 text-emerald-500" />,
  CreditCard: <CreditCard className="w-6 h-6 text-sky-500" />,
  AlertTriangle: <AlertTriangle className="w-6 h-6 text-amber-500" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-rose-500" />,
  Cpu: <Cpu className="w-6 h-6 text-purple-500" />,
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { role } = useAuth();
  const { categories, articles, isFavorite, toggleFavorite } = useKnowledge();

  const [searchFilter, setSearchFilter] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const category = categories.find((c) => c.slug === slug);
  const categoryArticles = articles.filter((a) => a.category_id === category?.id);

  const filteredArticles = categoryArticles.filter((art) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.tags_array.some((t) => t.toLowerCase().includes(q))
    );
  });

  if (!category) {
    return (
      <div className="py-16 text-center text-slate-500">
        <Folder className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <h2 className="text-xl font-bold">Категория не найдена</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Category Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
            {ICON_MAP[category.icon] || <Folder className="w-6 h-6 text-slate-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {category.description || "Регламенты и инструкции для операторов контакт-центра"}
            </p>
          </div>
        </div>

        {role === "admin" && (
          <Button
            size="sm"
            onClick={() => setIsEditorOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Добавить регламент
          </Button>
        )}
      </div>

      {/* Filter inside category */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Поиск внутри категории «${category.name}»...`}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Всего статей: {filteredArticles.length}
        </span>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          В этой категории пока нет статей или ничего не найдено по фильтру.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((art) => {
            const isFav = isFavorite(art.id);

            return (
              <div
                key={art.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      {art.short_steps_json.length > 0 && (
                        <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                          <Zap className="w-2.5 h-2.5 mr-0.5 fill-amber-500" />
                          Шпаргалка (3 сек)
                        </Badge>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(art.id)}
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
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
                      {art.title}
                    </h3>

                    {art.short_steps_json.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {art.short_steps_json.map((s) => `${s.step}. ${s.title}`).join(" • ")}
                      </p>
                    )}
                  </Link>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{art.views_count} просмотров</span>
                  </span>

                  <Link
                    href={`/articles/${art.id}`}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center hover:underline"
                  >
                    <span>Открыть</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
