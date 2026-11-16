"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Article, Category, NewsAlert, SynonymDictionary } from "@/types/database";
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_ALERTS, DEFAULT_SYNONYMS } from "@/lib/data/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";

interface KnowledgeContextType {
  articles: Article[];
  categories: Category[];
  alerts: NewsAlert[];
  urgentAlerts: NewsAlert[];
  favorites: string[];
  recentIds: string[];
  recentArticles: Article[];
  mostVisitedArticles: Article[];
  synonyms: SynonymDictionary;
  isSearchOpen: boolean;
  soundEnabled: boolean;
  setIsSearchOpen: (open: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleFavorite: (articleId: string) => void;
  isFavorite: (articleId: string) => boolean;
  addRecentArticle: (articleId: string) => void;
  recordArticleView: (articleId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  publishAlert: (newAlert: Omit<NewsAlert, "id" | "created_at">) => Promise<void>;
  saveArticle: (article: Partial<Article> & { title: string; category_id: string }) => Promise<Article>;
  deleteArticle: (articleId: string) => Promise<void>;
  updateSynonyms: (dict: SynonymDictionary) => void;
  getCategoryById: (id: string) => Category | undefined;
  getArticleById: (id: string) => Article | undefined;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

// Short web-audio synthesized chime for urgent alert notification
function playUrgentNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be blocked by autoplay policies
  }
}

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [alerts, setAlerts] = useState<NewsAlert[]>(INITIAL_ALERTS);
  const [synonyms, setSynonyms] = useState<SynonymDictionary>(DEFAULT_SYNONYMS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load local state & Supabase data
  useEffect(() => {
    // Load favorites from localStorage
    const savedFavs = localStorage.getItem("cc_favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch {}
    }

    // Load recent IDs from localStorage
    const savedRecents = localStorage.getItem("cc_recent_articles");
    if (savedRecents) {
      try {
        setRecentIds(JSON.parse(savedRecents));
      } catch {}
    }

    // Load custom articles from local storage if any
    const savedCustomArticles = localStorage.getItem("cc_custom_articles");
    if (savedCustomArticles) {
      try {
        const parsed = JSON.parse(savedCustomArticles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
        }
      } catch {}
    }

    // Load acknowledged alerts
    const savedAcks = localStorage.getItem("cc_ack_alerts");
    if (savedAcks) {
      try {
        const ackIds: string[] = JSON.parse(savedAcks);
        setAlerts((prev) =>
          prev.map((alert) =>
            ackIds.includes(alert.id) ? { ...alert, acknowledged: true } : alert
          )
        );
      } catch {}
    }

    // Connect to Supabase Realtime if live
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        // Fetch fresh alerts from Supabase
        supabase
          .from("news_alerts")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            if (data && data.length > 0) {
              setAlerts(data);
            }
          });

        // Fetch fresh articles from Supabase
        supabase
          .from("articles")
          .select("*")
          .order("views_count", { ascending: false })
          .then(({ data }) => {
            if (data && data.length > 0) {
              setArticles(data);
            }
          });

        // Subscribe to Realtime news_alerts
        const channel = supabase
          .channel("realtime-news-alerts")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "news_alerts" },
            (payload) => {
              const newAlert = payload.new as NewsAlert;
              setAlerts((prev) => [newAlert, ...prev]);
              if (newAlert.priority === "urgent" && soundEnabled) {
                playUrgentNotificationSound();
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [soundEnabled]);

  const toggleFavorite = useCallback((articleId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem("cc_favorites", JSON.stringify(next));

      // Sync with Supabase if live
      if (isSupabaseConfigured() && user) {
        const supabase = createClient();
        if (supabase) {
          if (next.includes(articleId)) {
            supabase.from("favorites").insert({ user_id: user.id, article_id: articleId });
          } else {
            supabase.from("favorites").delete().match({ user_id: user.id, article_id: articleId });
          }
        }
      }

      return next;
    });
  }, [user]);

  const isFavorite = useCallback(
    (articleId: string) => favorites.includes(articleId),
    [favorites]
  );

  const addRecentArticle = useCallback((articleId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== articleId);
      const next = [articleId, ...filtered].slice(0, 10);
      localStorage.setItem("cc_recent_articles", JSON.stringify(next));
      return next;
    });
  }, []);

  const recordArticleView = useCallback((articleId: string) => {
    setArticles((prev) => {
      const updated = prev.map((art) =>
        art.id === articleId ? { ...art, views_count: art.views_count + 1 } : art
      );
      localStorage.setItem("cc_custom_articles", JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        supabase.rpc("increment_article_views", { target_article_id: articleId });
      }
    }
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );

    const savedAcks = localStorage.getItem("cc_ack_alerts");
    const ackIds: string[] = savedAcks ? JSON.parse(savedAcks) : [];
    if (!ackIds.includes(alertId)) {
      ackIds.push(alertId);
      localStorage.setItem("cc_ack_alerts", JSON.stringify(ackIds));
    }

    if (isSupabaseConfigured() && user) {
      const supabase = createClient();
      if (supabase) {
        supabase.from("alert_reads").insert({ user_id: user.id, alert_id: alertId });
      }
    }
  }, [user]);

  const publishAlert = useCallback(async (newAlert: Omit<NewsAlert, "id" | "created_at">) => {
    const alertObj: NewsAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      created_at: new Date().toISOString(),
      acknowledged: false,
    };

    setAlerts((prev) => [alertObj, ...prev]);

    if (alertObj.priority === "urgent" && soundEnabled) {
      playUrgentNotificationSound();
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("news_alerts").insert({
          title: newAlert.title,
          content: newAlert.content,
          priority: newAlert.priority,
          tag: newAlert.tag,
          is_active: newAlert.is_active,
        });
      }
    }
  }, [soundEnabled]);

  const saveArticle = useCallback(async (
    articleData: Partial<Article> & { title: string; category_id: string }
  ): Promise<Article> => {
    const now = new Date().toISOString();
    let resultArticle: Article;

    if (articleData.id) {
      // Update existing
      resultArticle = {
        ...articles.find((a) => a.id === articleData.id)!,
        ...articleData,
        updated_at: now,
        updated_by: user?.full_name || "Руководитель КЦ",
      } as Article;

      setArticles((prev) => {
        const next = prev.map((a) => (a.id === resultArticle.id ? resultArticle : a));
        localStorage.setItem("cc_custom_articles", JSON.stringify(next));
        return next;
      });
    } else {
      // Create new
      resultArticle = {
        id: `art-${Date.now()}`,
        category_id: articleData.category_id,
        title: articleData.title,
        short_steps_json: articleData.short_steps_json || [],
        branching_scenarios_json: articleData.branching_scenarios_json || [],
        quick_scripts_json: articleData.quick_scripts_json || [],
        full_content_markdown: articleData.full_content_markdown || "",
        tags_array: articleData.tags_array || [],
        synonyms_array: articleData.synonyms_array || [],
        views_count: 0,
        is_pinned: false,
        updated_by: user?.full_name || "Руководитель КЦ",
        created_at: now,
        updated_at: now,
      };

      setArticles((prev) => {
        const next = [resultArticle, ...prev];
        localStorage.setItem("cc_custom_articles", JSON.stringify(next));
        return next;
      });
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("articles").upsert({
          id: resultArticle.id.startsWith("art-") ? undefined : resultArticle.id,
          category_id: resultArticle.category_id,
          title: resultArticle.title,
          short_steps_json: resultArticle.short_steps_json,
          branching_scenarios_json: resultArticle.branching_scenarios_json,
          quick_scripts_json: resultArticle.quick_scripts_json,
          full_content_markdown: resultArticle.full_content_markdown,
          tags_array: resultArticle.tags_array,
          synonyms_array: resultArticle.synonyms_array,
          updated_by: resultArticle.updated_by,
        });
      }
    }

    return resultArticle;
  }, [articles, user]);

  const deleteArticle = useCallback(async (articleId: string) => {
    setArticles((prev) => {
      const next = prev.filter((a) => a.id !== articleId);
      localStorage.setItem("cc_custom_articles", JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("articles").delete().eq("id", articleId);
      }
    }
  }, []);

  const updateSynonyms = useCallback((newDict: SynonymDictionary) => {
    setSynonyms(newDict);
    localStorage.setItem("cc_synonyms", JSON.stringify(newDict));
  }, []);

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const getArticleById = useCallback(
    (id: string) => articles.find((a) => a.id === id),
    [articles]
  );

  const urgentAlerts = alerts.filter(
    (a) => a.priority === "urgent" && a.is_active && !a.acknowledged
  );

  const recentArticles = recentIds
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is Article => Boolean(a));

  const mostVisitedArticles = [...articles].sort(
    (a, b) => b.views_count - a.views_count
  ).slice(0, 6);

  return (
    <KnowledgeContext.Provider
      value={{
        articles,
        categories,
        alerts,
        urgentAlerts,
        favorites,
        recentIds,
        recentArticles,
        mostVisitedArticles,
        synonyms,
        isSearchOpen,
        soundEnabled,
        setIsSearchOpen,
        setSoundEnabled,
        toggleFavorite,
        isFavorite,
        addRecentArticle,
        recordArticleView,
        acknowledgeAlert,
        publishAlert,
        saveArticle,
        deleteArticle,
        updateSynonyms,
        getCategoryById,
        getArticleById,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error("useKnowledge must be used within KnowledgeProvider");
  }
  return context;
}
