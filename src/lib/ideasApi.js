import { isLocalDataMode } from "./dataMode";
import * as localData from "./localData";
import { mapIdeaFromDb } from "./mappers";
import { getSupabase, isSupabaseConfigured } from "./supabase";

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. .env 파일을 확인하거나 VITE_DATA_MODE=local 을 사용하세요.",
    );
  }
}

function toDbErrorMessage(error) {
  return error?.message || "데이터 처리 중 오류가 발생했습니다.";
}

async function fetchSupabaseIdeasByAuthor(authorId) {
  ensureSupabaseConfigured();

  const { data, error } = await getSupabase()
    .from("ideas")
    .select("id, author_id, category, title, description")
    .eq("author_id", authorId)
    .order("id", { ascending: false });

  if (error) throw new Error(toDbErrorMessage(error));
  return (data ?? []).map(mapIdeaFromDb);
}

async function createSupabaseIdea(authorId, { category, title, description }) {
  ensureSupabaseConfigured();

  const { data, error } = await getSupabase()
    .from("ideas")
    .insert({
      author_id: authorId,
      category,
      title,
      description,
    })
    .select("id, author_id, category, title, description")
    .single();

  if (error) throw new Error(toDbErrorMessage(error));
  return mapIdeaFromDb(data);
}

async function updateSupabaseIdea(
  ideaId,
  { category, title, description, authorId },
) {
  ensureSupabaseConfigured();

  const { data, error } = await getSupabase()
    .from("ideas")
    .update({ category, title, description })
    .eq("id", ideaId)
    .eq("author_id", authorId)
    .select("id, author_id, category, title, description")
    .single();

  if (error) throw new Error(toDbErrorMessage(error));
  return mapIdeaFromDb(data);
}

async function deleteSupabaseIdea(ideaId, authorId) {
  ensureSupabaseConfigured();

  const { error } = await getSupabase()
    .from("ideas")
    .delete()
    .eq("id", ideaId)
    .eq("author_id", authorId);

  if (error) throw new Error(toDbErrorMessage(error));
}

export async function fetchIdeasByAuthor(authorId) {
  if (isLocalDataMode()) return localData.fetchIdeasByAuthor(authorId);
  return fetchSupabaseIdeasByAuthor(authorId);
}

export async function createIdea(authorId, ideaData) {
  if (isLocalDataMode()) return localData.createIdea(authorId, ideaData);
  return createSupabaseIdea(authorId, ideaData);
}

export async function updateIdea(ideaId, payload) {
  if (isLocalDataMode()) return localData.updateIdea(ideaId, payload);
  return updateSupabaseIdea(ideaId, payload);
}

export async function deleteIdea(ideaId, authorId) {
  if (isLocalDataMode()) return localData.deleteIdea(ideaId, authorId);
  return deleteSupabaseIdea(ideaId, authorId);
}
