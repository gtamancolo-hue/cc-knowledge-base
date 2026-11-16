"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Article } from "@/types/database";
import { BookOpen, AlertCircle, Info, CheckCircle } from "lucide-react";

interface FullRegulationViewProps {
  article: Article;
}

export function FullRegulationView({ article }: FullRegulationViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-fade-in">
      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 text-indigo-600 dark:text-indigo-400" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-r-xl my-4 text-slate-700 dark:text-slate-300 italic" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm border-collapse" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="p-3 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300" {...props} />
            ),
            code: ({ node, className, children, ...props }) => {
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {article.full_content_markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
