import { normalizeRoadmapYear } from "../constants/roadmapYears.js";

export function mapUserFromDb(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}

export function mapIdeaFromDb(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    category: row.category,
    title: row.title,
    description: row.description ?? "",
  };
}

export function mapRoadmapFromDb(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    year: normalizeRoadmapYear(row.year),
    title: row.title,
    description: row.description ?? "",
    startMonth: row.start_month,
    endMonth: row.end_month,
  };
}
