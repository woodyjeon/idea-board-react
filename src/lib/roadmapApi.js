import { isLocalDataMode } from "./dataMode";
import * as localData from "./localData";
import { mapRoadmapFromDb } from "./mappers";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const ROADMAP_COLUMNS =
  "id, author_id, year, title, description, start_month, end_month";

const ROADMAP_FALLBACK_STORAGE_KEY = "sparkboard:roadmaps:supabase-unavailable";

function readRoadmapFallbackFlag() {
  try {
    return localStorage.getItem(ROADMAP_FALLBACK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let supabaseRoadmapFallback = readRoadmapFallbackFlag();

export function isRoadmapFallbackMode() {
  return supabaseRoadmapFallback;
}

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. .env 파일을 확인하거나 VITE_DATA_MODE=local 을 사용하세요.",
    );
  }
}

function isRoadmapTableMissing(error) {
  const message = (error?.message ?? "").toLowerCase();
  const code = error?.code ?? "";

  return (
    code === "PGRST205" ||
    code === "42P01" ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    (message.includes("roadmaps") && message.includes("does not exist"))
  );
}

function enableSupabaseFallback() {
  if (supabaseRoadmapFallback) return;

  supabaseRoadmapFallback = true;
  try {
    localStorage.setItem(ROADMAP_FALLBACK_STORAGE_KEY, "1");
  } catch {
    // localStorage unavailable — in-memory flag still applies this session
  }
}

function fetchLocalRoadmaps(authorId) {
  return localData.fetchRoadmapsByAuthor(authorId);
}

function toDbErrorMessage(error) {
  return error?.message || "로드맵 처리 중 오류가 발생했습니다.";
}

function buildRoadmapWritePayload(authorId, data) {
  return {
    author_id: authorId,
    year: data.year,
    title: data.title,
    description: data.description,
    start_month: data.startMonth,
    end_month: data.endMonth,
  };
}

async function fetchSupabaseRoadmapsByAuthor(authorId) {
  if (supabaseRoadmapFallback) {
    return fetchLocalRoadmaps(authorId);
  }

  ensureSupabaseConfigured();

  const { data, error } = await getSupabase()
    .from("roadmaps")
    .select(ROADMAP_COLUMNS)
    .eq("author_id", authorId)
    .order("start_month", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    if (isRoadmapTableMissing(error)) {
      enableSupabaseFallback();
      return fetchLocalRoadmaps(authorId);
    }
    throw new Error(toDbErrorMessage(error));
  }

  return (data ?? []).map(mapRoadmapFromDb);
}

async function createSupabaseRoadmap(authorId, payload) {
  if (supabaseRoadmapFallback) {
    return localData.createRoadmap(authorId, payload);
  }

  ensureSupabaseConfigured();

  const { data, error } = await getSupabase()
    .from("roadmaps")
    .insert(buildRoadmapWritePayload(authorId, payload))
    .select(ROADMAP_COLUMNS)
    .single();

  if (error) {
    if (isRoadmapTableMissing(error)) {
      enableSupabaseFallback();
      return localData.createRoadmap(authorId, payload);
    }
    throw new Error(toDbErrorMessage(error));
  }

  return mapRoadmapFromDb(data);
}

async function updateSupabaseRoadmap(roadmapId, payload) {
  if (supabaseRoadmapFallback) {
    return localData.updateRoadmap(roadmapId, payload);
  }

  ensureSupabaseConfigured();

  const updatePayload = buildRoadmapWritePayload(payload.authorId, payload);
  delete updatePayload.author_id;

  const { data, error } = await getSupabase()
    .from("roadmaps")
    .update(updatePayload)
    .eq("id", roadmapId)
    .eq("author_id", payload.authorId)
    .select(ROADMAP_COLUMNS)
    .single();

  if (error) {
    if (isRoadmapTableMissing(error)) {
      enableSupabaseFallback();
      return localData.updateRoadmap(roadmapId, payload);
    }
    throw new Error(toDbErrorMessage(error));
  }

  return mapRoadmapFromDb(data);
}

async function deleteSupabaseRoadmap(roadmapId, authorId) {
  if (supabaseRoadmapFallback) {
    return localData.deleteRoadmap(roadmapId, authorId);
  }

  ensureSupabaseConfigured();

  const { error } = await getSupabase()
    .from("roadmaps")
    .delete()
    .eq("id", roadmapId)
    .eq("author_id", authorId);

  if (error) {
    if (isRoadmapTableMissing(error)) {
      enableSupabaseFallback();
      return localData.deleteRoadmap(roadmapId, authorId);
    }
    throw new Error(toDbErrorMessage(error));
  }
}

export async function fetchRoadmapsByAuthor(authorId) {
  if (isLocalDataMode()) return localData.fetchRoadmapsByAuthor(authorId);
  return fetchSupabaseRoadmapsByAuthor(authorId);
}

export async function createRoadmap(authorId, payload) {
  if (isLocalDataMode()) return localData.createRoadmap(authorId, payload);
  return createSupabaseRoadmap(authorId, payload);
}

export async function updateRoadmap(roadmapId, payload) {
  if (isLocalDataMode()) return localData.updateRoadmap(roadmapId, payload);
  return updateSupabaseRoadmap(roadmapId, payload);
}

export async function deleteRoadmap(roadmapId, authorId) {
  if (isLocalDataMode()) return localData.deleteRoadmap(roadmapId, authorId);
  return deleteSupabaseRoadmap(roadmapId, authorId);
}
