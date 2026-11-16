import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { KnowledgeProvider } from "@/context/knowledge-context";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "КЦ База Знаний — Платформа поддержки операторов контакт-центра",
  description:
    "Защищенная веб-платформа корпоративной базы знаний для контакт-центра с мгновенным поиском, режимом быстрых шпаргалок, системой срочных оповещений и CMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16]">
        <ThemeProvider>
          <AuthProvider>
            <KnowledgeProvider>
              <AppShell>{children}</AppShell>
            </KnowledgeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
