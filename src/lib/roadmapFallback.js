import { INITIAL_ROADMAPS } from "../data/initialRoadmaps.js";

/** @type {Map<number, import('../data/initialRoadmaps.js').INITIAL_ROADMAPS[0][]>} */
const storeByAuthor = new Map();

function ensureStore(authorId) {
  if (!storeByAuthor.has(authorId)) {
    const seeded = INITIAL_ROADMAPS.filter((item) => item.authorId === authorId).map(
      (item) => ({ ...item }),
    );
    storeByAuthor.set(authorId, seeded);
  }
  return storeByAuthor.get(authorId);
}

function sortItems(items) {
  return [...items].sort(
    (a, b) =>
      a.year - b.year || a.startMonth - b.startMonth || a.id - b.id,
  );
}

export function fetchFallbackRoadmaps(authorId) {
  return sortItems(ensureStore(authorId));
}

export function createFallbackRoadmap(authorId, payload) {
  const items = ensureStore(authorId);
  const id = Math.max(0, ...items.map((item) => item.id), 0) + 1;
  const created = { id, authorId, ...payload };
  items.push(created);
  return created;
}

export function updateFallbackRoadmap(roadmapId, payload) {
  const items = ensureStore(payload.authorId);
  const index = items.findIndex(
    (item) => item.id === roadmapId && item.authorId === payload.authorId,
  );
  if (index < 0) {
    throw new Error("수정할 로드맵 항목을 찾을 수 없습니다.");
  }
  const updated = {
    ...items[index],
    title: payload.title,
    description: payload.description,
    year: payload.year,
    startMonth: payload.startMonth,
    endMonth: payload.endMonth,
  };
  items[index] = updated;
  return updated;
}

export function deleteFallbackRoadmap(roadmapId, authorId) {
  const items = ensureStore(authorId);
  const next = items.filter(
    (item) => !(item.id === roadmapId && item.authorId === authorId),
  );
  if (next.length === items.length) {
    throw new Error("삭제할 로드맵 항목을 찾을 수 없습니다.");
  }
  storeByAuthor.set(authorId, next);
}
