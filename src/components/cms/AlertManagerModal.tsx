"use client";

import React, { useState } from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { AlertPriority } from "@/types/database";
import {
  X,
  AlertOctagon,
  Bell,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";

interface AlertManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertManagerModal({ isOpen, onClose }: AlertManagerModalProps) {
  const { publishAlert } = useKnowledge();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<AlertPriority>("urgent");
  const [tag, setTag] = useState("Критический сбой");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Пожалуйста, заполните заголовок и текст сообщения", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await publishAlert({
        title: title.trim(),
        content: content.trim(),
        priority,
        tag: tag.trim() || (priority === "urgent" ? "Срочно" : "Обновление"),
        is_active: true,
      });

      showToast(
        priority === "urgent"
          ? "Срочный алерт-баннер опубликован и отправлен операторам!"
          : "Новость успешно опубликована в ленте!"
      );
      onClose();
    } catch {
      showToast("Ошибка при публикации оповещения", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${priority === "urgent" ? "bg-red-100 text-red-600 dark:bg-red-950/50" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50"}`}>
              {priority === "urgent" ? <AlertOctagon className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {priority === "urgent" ? "Опубликовать срочный алерт" : "Создать новость процесса"}
              </h2>
              <p className="text-xs text-slate-500">
                Мгновенное уведомление операторов на линии
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Тип оповещения
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPriority("urgent");
                  setTag("Критический сбой");
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  priority === "urgent"
                    ? "bg-red-50 text-red-700 border-red-500 dark:bg-red-950/40 dark:text-red-300"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-red-500" />
                <span>Срочный баннер (Красный)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPriority("normal");
                  setTag("Обновление регламента");
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  priority === "normal"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Bell className="w-4 h-4 text-indigo-500" />
                <span>Обычная новость в ленту</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Заголовок сообщения *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр: Сбой оплаты по СБП — переводить клиентов на карты"
              className="text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Метка / Тег
            </label>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Критический сбой, Новый скрипт, Важно..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Подробный текст для операторов *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Опишите, что произошло и как оператор должен отвечать клиентам прямо сейчас..."
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={priority === "urgent" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Отправка..." : "Опубликовать"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
