import { isSupabaseConfigured } from "./supabase";

/** @typedef {'local' | 'supabase'} DataMode */

/**
 * 데이터 저장 방식
 * - supabase: Supabase Auth + PostgreSQL
 * - local: localStorage (DB 불필요)
 *
 * VITE_DATA_MODE 미설정 시 Supabase env 있으면 supabase, 없으면 local
 */
export function getDataMode() {
  const forced = import.meta.env.VITE_DATA_MODE?.trim().toLowerCase();

  if (forced === "local") return "local";

  if (forced === "supabase") {
    if (!isSupabaseConfigured()) {
      console.warn(
        "VITE_DATA_MODE=supabase 이지만 Supabase env가 없어 local 모드로 동작합니다.",
      );
      return "local";
    }
    return "supabase";
  }

  return isSupabaseConfigured() ? "supabase" : "local";
}

export function isLocalDataMode() {
  return getDataMode() === "local";
}
