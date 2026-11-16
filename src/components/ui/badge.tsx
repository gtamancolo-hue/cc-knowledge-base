"use client";

import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "urgent" | "warning" | "success" | "blue";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variantStyles = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
    destructive: "bg-red-500 text-white",
    urgent: "bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
    warning: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    blue: "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    outline: "text-foreground border border-slate-300 dark:border-slate-700",
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      {...props}
    />
  );
}
