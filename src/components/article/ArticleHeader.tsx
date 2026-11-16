"use client";

import React from "react";
import { Article, Category } from "@/types/database";
import { useAuth } from "@/context/auth-context";
import { useKnowledge } from "@/context/knowledge-context";
import {
  Star,
  Eye,
  Clock,
  User,
  Edit3,
  Share2,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";

interface ArticleHeaderProps {
  article: Article;
  category?: Category;
  onEdit?: () => void;
}

export function ArticleHeader({ article, category, onEdit }: ArticleHeaderProps) {
  const { role } = useAuth();
  const { isFavorite, toggleFavorite } = useKnowledge();

  const isFav = isFavorite(article.id);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Ссылка на статью скопирована в буфер!");
    }
  };

  const formattedDate = new Date(article.updated_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
      {/* Category & Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          {category && (
            <Badge variant="secondary" className="text-xs font-medium">
              <Folder className="w-3 h-3 mr-1 text-slate-400" />
              {category.name}
            </Badge>
          )}
          {article.is_pinned && (
            <Badge variant="warning" className="text-xs font-semibold">
              Закреплено
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Favorite Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavorite(article.id)}
            className={`transition-colors ${
              isFav ? "text-amber-500 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20" : ""
            }`}
          >
            <Star className={`w-4 h-4 mr-1.5 ${isFav ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
            <span>{isFav ? "В избранном" : "В избранное"}</span>
          </Button>

          {/* Share Button */}
          <Button variant="ghost" size="icon" onClick={handleShare} title="Скопировать ссылку">
            <Share2 className="w-4 h-4 text-slate-500" />
          </Button>

          {/* Edit Button for Admin/Teamlead */}
          {role === "admin" && (
            <Button
              variant="default"
              size="sm"
              onClick={onEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Edit3 className="w-4 h-4 mr-1.5" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        {article.title}
      </h1>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>{article.views_count} просмотров на линии</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Обновлено: {formattedDate}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Автор: {article.updated_by}</span>
        </div>
      </div>

      {/* Tags */}
      {article.tags_array.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags_array.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
