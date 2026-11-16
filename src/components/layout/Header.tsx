"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useKnowledge } from "@/context/knowledge-context";
import { useTheme } from "@/context/theme-context";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ShieldCheck,
  Headphones,
  LogOut,
  Sparkles,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user, role, switchRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    setIsSearchOpen,
    alerts,
    urgentAlerts,
    soundEnabled,
    setSoundEnabled,
    acknowledgeAlert,
  } = useKnowledge();

  const [showBellMenu, setShowBellMenu] = useState(false);

  const unreadUrgentCount = urgentAlerts.length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Fast Search Trigger */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Instant Search Trigger (Operator Hotkey Bar) */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 text-sm transition-all shadow-inner group"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Search className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
            <span className="truncate font-normal">
              Поиск регламентов, синонимов, фраз...
            </span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs">
              Ctrl+K
            </kbd>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs">
              /
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Alerts Bell, Sound Toggle, Theme, Role Switcher & User */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Audio Mute/Unmute */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Звуковые оповещения включены" : "Звук отключен"}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBellMenu((prev) => !prev)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            aria-label="Уведомления"
          >
            <Bell className="w-4 h-4" />
            {unreadUrgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping" />
            )}
            {unreadUrgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            )}
          </button>

          {showBellMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-sm">Центр оповещений</span>
                <Badge variant={unreadUrgentCount > 0 ? "urgent" : "secondary"}>
                  {alerts.length} сообщений
                </Badge>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 text-xs sm:text-sm ${
                      alert.priority === "urgent" && !alert.acknowledged
                        ? "bg-red-50/70 dark:bg-red-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-semibold ${
                          alert.priority === "urgent"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {alert.title}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mb-2">
                      {alert.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={alert.priority === "urgent" ? "urgent" : "secondary"}
                        className="text-[10px]"
                      >
                        {alert.tag}
                      </Badge>
                      {alert.priority === "urgent" && !alert.acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline"
                        >
                          Подтвердить прочтение
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Ознакомлен</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Сменить тему"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Quick Role Switcher for seamless testing */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-400">Роль:</span>
          <button
            onClick={() => switchRole(role === "operator" ? "admin" : "operator")}
            className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded transition-colors hover:bg-white dark:hover:bg-slate-700"
            title="Нажмите, чтобы переключить роль"
          >
            {role === "admin" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-indigo-600 dark:text-indigo-400">Руководитель</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Оператор</span>
              </>
            )}
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user?.full_name ? user.full_name[0].toUpperCase() : "К"}
          </div>
          <button
            onClick={() => signOut()}
            title="Выйти из системы"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
