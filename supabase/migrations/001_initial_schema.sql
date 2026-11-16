-- ====================================================================
-- CC-KNOWLEDGE-BASE: INITIAL POSTGRESQL SCHEMA WITH RLS & REALTIME
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('operator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_priority AS ENUM ('normal', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT 'Folder',
    sort_order INT NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. ARTICLES TABLE (Dual-mode: Short Steps + Branching + Full Markdown)
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    short_steps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    branching_scenarios_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    quick_scripts_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    full_content_markdown TEXT NOT NULL DEFAULT '',
    tags_array TEXT[] NOT NULL DEFAULT '{}',
    synonyms_array TEXT[] NOT NULL DEFAULT '{}',
    views_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    updated_by TEXT NOT NULL DEFAULT 'Руководитель КЦ',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, article_id)
);

-- 7. NEWS & URGENT ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.news_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority alert_priority NOT NULL DEFAULT 'normal',
    tag TEXT NOT NULL DEFAULT 'Обновление',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    expires_at TIMESTAMPTZ
);

-- 8. ALERT READS (Operator Acknowledgment)
CREATE TABLE IF NOT EXISTS public.alert_reads (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_id UUID NOT NULL REFERENCES public.news_alerts(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, alert_id)
);

-- 9. SYNONYMS DICTIONARY (For live search synonym expansion)
CREATE TABLE IF NOT EXISTS public.synonyms_dict (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL UNIQUE,
    synonyms TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE & FULL-TEXT SEARCH
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_views ON public.articles(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags_array);
CREATE INDEX IF NOT EXISTS idx_articles_synonyms ON public.articles USING GIN(synonyms_array);
CREATE INDEX IF NOT EXISTS idx_articles_title ON public.articles(title);
CREATE INDEX IF NOT EXISTS idx_news_alerts_active ON public.news_alerts(is_active, priority);

-- PostgreSQL Full-Text Search index (Russian configuration)
CREATE INDEX IF NOT EXISTS idx_articles_fts ON public.articles USING GIN (
    to_tsvector('russian', title || ' ' || full_content_markdown)
);

-- ====================================================================
-- TRIGGERS & FUNCTIONS
-- ====================================================================

-- Automatic updated_at refresher
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Safe RPC function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(target_article_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.articles
    SET views_count = views_count + 1
    WHERE id = target_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatically create a profile record when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'operator'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synonyms_dict ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES RLS
CREATE POLICY "Profiles readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile or admin can update all"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

-- CATEGORIES RLS
CREATE POLICY "Categories readable by authenticated users"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Categories editable only by admins"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ARTICLES RLS
CREATE POLICY "Articles readable by authenticated users"
    ON public.articles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Articles editable only by admins"
    ON public.articles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- FAVORITES RLS
CREATE POLICY "Users can view their own favorites"
    ON public.favorites FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON public.favorites FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON public.favorites FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- NEWS ALERTS RLS
CREATE POLICY "Alerts readable by authenticated users"
    ON public.news_alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Alerts editable only by admins"
    ON public.news_alerts FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ALERT READS RLS
CREATE POLICY "Users can read their alert acknowledgments"
    ON public.alert_reads FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge alerts"
    ON public.alert_reads FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- SYNONYMS RLS
CREATE POLICY "Synonyms readable by authenticated users"
    ON public.synonyms_dict FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Synonyms editable only by admins"
    ON public.synonyms_dict FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ====================================================================
-- ENABLE REALTIME FOR URGENT ALERTS AND ARTICLES
-- ====================================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.news_alerts;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
