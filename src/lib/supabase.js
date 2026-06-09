import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase 환경 변수가 없습니다. local 모드로 동작하거나 .env에 VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY를 설정하세요.",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}
