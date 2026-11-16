import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_ARTICLES } from "@/lib/data/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      let query = supabase.from("articles").select("*").order("views_count", { ascending: false });
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json(data);
      }
    }
  }

  // Fallback to initial mock articles
  let result = INITIAL_ARTICLES;
  if (categoryId) {
    result = result.filter((a) => a.category_id === categoryId);
  }

  return NextResponse.json(result);
}
