import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "cc-knowledge-base",
    version: "1.0.0",
    supabase_configured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
