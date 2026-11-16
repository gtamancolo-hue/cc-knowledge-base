"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  BookOpen,
  Lock,
  Mail,
  Headphones,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading, isSupabaseLive } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Пожалуйста, заполните email и пароль");
      return;
    }

    const res = await signIn(email, password);
    if (res.success) {
      showToast("Вход успешно выполнен!");
      router.push("/");
    } else {
      setErrorMsg(res.error || "Неверный логин или пароль");
    }
  };

  const handleQuickDemoLogin = async (role: "operator" | "admin") => {
    setErrorMsg("");
    const demoEmail = role === "admin" ? "admin@contact-center.corp" : "operator@contact-center.corp";
    const res = await signIn(demoEmail, "Password123!", role);
    if (res.success) {
      showToast(role === "admin" ? "Вход с правами Руководителя" : "Вход с правами Оператора");
      router.push("/");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            КЦ База Знаний
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Вход в закрытую корпоративную систему контакт-центра
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Публичная регистрация закрыта. Доступ предоставляется только авторизованным сотрудникам.
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Корпоративный Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@contact-center.corp"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 text-sm shadow-md transition-all active:scale-98"
          >
            {isLoading ? "Авторизация..." : "Войти в систему"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Demo Fast Login Buttons for Testing */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
            Быстрый демо-вход для тестирования:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("operator")}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col items-center space-y-1 transition-all"
            >
              <Headphones className="w-4 h-4 text-emerald-500" />
              <span>Оператор линии</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("admin")}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col items-center space-y-1 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Руководитель КЦ</span>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400">
          Режим аутентификации: {isSupabaseLive ? "Supabase Auth (PostgreSQL)" : "Demo Mode Mock Auth"}
        </div>
      </div>
    </div>
  );
}
