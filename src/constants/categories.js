export const INITIAL_CATEGORIES = ["AI", "바이오", "반도체", "에너지", "기타"];

/** Supabase ideas.category_id 매핑 (categories 테이블 비어 있을 때 fallback) */
export const CATEGORY_ID_BY_NAME = {
  AI: 4,
  바이오: 2,
  반도체: 3,
  에너지: 5,
  기타: 1,
};
