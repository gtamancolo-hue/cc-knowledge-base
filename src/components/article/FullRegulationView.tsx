"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Article } from "@/types/database";

interface FullRegulationViewProps {
  article: Article;
}

/**
 * Normalizes markdown text: removes unwanted indentation on lines
 * that causes markdown to mistakenly render codeblocks instead of headings and paragraphs.
 */
function normalizeMarkdown(rawText?: string): string {
  if (!rawText) return "";

  // Split lines and trim leading spaces if they were caused by SQL or JS string templates
  const lines = rawText.split("\n");
  const cleaned = lines.map((line) => {
    // If line starts with 4+ spaces but is not an intended indented codeblock, trim leading whitespace
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith(">") ||
      trimmed.startsWith("|") ||
      trimmed.startsWith("-") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("1.") ||
      trimmed.startsWith("2.") ||
      trimmed.startsWith("3.") ||
      trimmed.startsWith("---")
    ) {
      return trimmed;
    }
    // For regular text lines, remove indentation if excessive
    return line.replace(/^[ \t]{4,}/, "");
  });

  return cleaned.join("\n");
}

export function FullRegulationView({ article }: FullRegulationViewProps) {
  const content = useMemo(
    () => normalizeMarkdown(article.full_content_markdown),
    [article.full_content_markdown]
  );

  if (!content) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
        Текст полного регламента еще не заполнен для этой статьи.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-fade-in overflow-hidden">
      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => (
              <h1
                className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 text-indigo-600 dark:text-indigo-400"
                {...props}
              />
            ),
            p: ({ ...props }) => (
              <p
                className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed"
                {...props}
              />
            ),
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-r-xl my-4 text-slate-700 dark:text-slate-300 italic"
                {...props}
              />
            ),
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <table
                  className="w-full text-left text-sm border-collapse"
                  {...props}
                />
              </div>
            ),
            thead: ({ ...props }) => (
              <thead
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                {...props}
              />
            ),
            th: ({ ...props }) => (
              <th
                className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold"
                {...props}
              />
            ),
            td: ({ ...props }) => (
              <td
                className="p-3 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul
                className="list-disc pl-5 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300"
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-700 dark:text-slate-300"
                {...props}
              />
            ),
            pre: ({ ...props }) => (
              <pre
                className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto my-4 text-xs font-mono"
                {...props}
              />
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
