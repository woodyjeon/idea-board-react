export function isIdeaOwner(idea, userId) {
  if (userId == null || idea.authorId == null) return false;
  return idea.authorId === userId;
}
