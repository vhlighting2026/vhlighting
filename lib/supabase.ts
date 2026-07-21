import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!rawUrl || !key) throw new Error("Thiếu biến môi trường Supabase");

const url = rawUrl.replace(/\/(rest|auth)\/v1\/?$/i, "").replace(/\/$/, "");
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
