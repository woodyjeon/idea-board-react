import { CATEGORY_ID_BY_NAME } from "../constants/categories.js";
import { isLocalDataMode } from "./dataMode";
import * as localData from "./localData";
import { mapIdeaFromDb } from "./mappers";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const IDEA_COLUMNS = "id, author_id, category, category_id, title, description";
const IDEA_COLUMNS_BASIC = "id, author_id, category, title, description";

/** @type {Map<string, number> | null} */
let categoryMapCache = null;

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. .env 파일을 확인하거나 VITE_DATA_MODE=local 을 사용하세요.",
    );
  }
}

function toDbErrorMessage(error) {
  const message = error?.message || "데이터 처리 중 오류가 발생했습니다.";
  if (message.includes("category_id")) {
    return "분야(category_id) 정보가 DB와 맞지 않습니다. Supabase categories 테이블을 확인해주세요.";
  }
  return message;
}

function addCategoryMapping(map, name, id) {
  if (name && id != null && !map.has(name)) {
    map.set(name, id);
  }
}

async function loadCategoryMap() {
  if (categoryMapCache) return categoryMapCache;

  const map = new Map();

  const { data: categories, error: categoriesError } = await getSupabase()
    .from("categories")
    .select("*");

  if (!categoriesError) {
    for (const row of categories ?? []) {
      const name = row.name ?? row.label ?? row.title ?? row.category;
      addCategoryMapping(map, name, row.id);
    }
  }

  if (map.size === 0) {
    const { data: ideas } = await getSupabase()
      .from("ideas")
      .select("category, category_id");

    for (const row of ideas ?? []) {
      addCategoryMapping(map, row.category, row.category_id);
    }
  }

  if (map.size === 0) {
    for (const [name, id] of Object.entries(CATEGORY_ID_BY_NAME)) {
      addCategoryMapping(map, name, id);
    }
  }

  categoryMapCache = map;
  return map;
}

async function resolveCategoryId(categoryName) {
  const map = await loadCategoryMap();
  return map.get(categoryName) ?? null;
}

async function buildIdeaWritePayload(authorId, { category, title, description }) {
  const categoryId = await resolveCategoryId(category);

  if (categoryId == null) {
    throw new Error(
      `분야 "${category}"의 category_id를 찾지 못했습니다. Supabase categories 테이블을 확인해주세요.`,
    );
  }

  return {
    author_id: authorId,
    category,
    category_id: categoryId,
    title,
    description,
  };
}

async function fetchSupabaseIdeasByAuthor(authorId) {
  ensureSupabaseConfigured();

  let { data, error } = await getSupabase()
    .from("ideas")
    .select(IDEA_COLUMNS)
    .eq("author_id", authorId)
    .order("id", { ascending: false });

  if (error) {
    ({ data, error } = await getSupabase()
      .from("ideas")
      .select(IDEA_COLUMNS_BASIC)
      .eq("author_id", authorId)
      .order("id", { ascending: false }));
  }

  if (error) throw new Error(toDbErrorMessage(error));
  return (data ?? []).map(mapIdeaFromDb);
}

async function createSupabaseIdea(authorId, { category, title, description }) {
  ensureSupabaseConfigured();

  const insertPayload = await buildIdeaWritePayload(authorId, {
    category,
    title,
    description,
  });

  let { data, error } = await getSupabase()
    .from("ideas")
    .insert(insertPayload)
    .select(IDEA_COLUMNS)
    .single();

  if (error) {
    ({ data, error } = await getSupabase()
      .from("ideas")
      .insert(insertPayload)
      .select(IDEA_COLUMNS_BASIC)
      .single());
  }

  if (error) throw new Error(toDbErrorMessage(error));
  return mapIdeaFromDb(data);
}

async function updateSupabaseIdea(
  ideaId,
  { category, title, description, authorId },
) {
  ensureSupabaseConfigured();

  const updatePayload = await buildIdeaWritePayload(authorId, {
    category,
    title,
    description,
  });
  delete updatePayload.author_id;

  let { data, error } = await getSupabase()
    .from("ideas")
    .update(updatePayload)
    .eq("id", ideaId)
    .eq("author_id", authorId)
    .select(IDEA_COLUMNS)
    .single();

  if (error) {
    ({ data, error } = await getSupabase()
      .from("ideas")
      .update(updatePayload)
      .eq("id", ideaId)
      .eq("author_id", authorId)
      .select(IDEA_COLUMNS_BASIC)
      .single());
  }

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
