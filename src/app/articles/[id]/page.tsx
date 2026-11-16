"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useKnowledge } from "@/context/knowledge-context";
import { useAuth } from "@/context/auth-context";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ModeToggle, ArticleViewMode } from "@/components/article/ModeToggle";
import { CheatSheetView } from "@/components/article/CheatSheetView";
import { FullRegulationView } from "@/components/article/FullRegulationView";
import { ArticleEditorModal } from "@/components/cms/ArticleEditorModal";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const {
    getArticleById,
    getCategoryById,
    recordArticleView,
    addRecentArticle,
  } = useKnowledge();

  const [mode, setMode] = useState<ArticleViewMode>("cheatsheet"); // Default to 3-5 sec cheat sheet per requirements
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const article = getArticleById(articleId);
  const category = article ? getCategoryById(article.category_id) : undefined;

  useEffect(() => {
    if (articleId) {
      recordArticleView(articleId);
      addRecentArticle(articleId);
    }
  }, [articleId, recordArticleView, addRecentArticle]);

  if (!article) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Статья не найдена или была удалена
        </h2>
        <p className="text-sm text-slate-500">
          Проверьте правильность ссылки или воспользуйтесь поиском по базе.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>К списку регламентов</span>
        </Link>
      </div>

      {/* Article Header with Metadata, Favorites & Admin Edit Trigger */}
      <ArticleHeader
        article={article}
        category={category}
        onEdit={() => setIsEditorOpen(true)}
      />

      {/* Dual Mode Switcher (Call Mode 3-5 sec vs Full Regulation) */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Main Mode View */}
      {mode === "cheatsheet" ? (
        <CheatSheetView article={article} />
      ) : (
        <FullRegulationView article={article} />
      )}

      {/* Admin CMS Editor Modal */}
      <ArticleEditorModal
        article={article}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
