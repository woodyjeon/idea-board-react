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
