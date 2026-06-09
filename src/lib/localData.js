import { INITIAL_IDEAS } from "../data/initialIdeas.js";
import { LOCAL_USERS } from "../data/users.js";

const STORAGE_KEYS = {
  users: "sparkboard:users:v2",
  session: "sparkboard:session",
  ideas: "sparkboard:ideas",
};

const authListeners = new Set();

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function notifyAuth(user) {
  authListeners.forEach((listener) => listener(user));
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

function ensureUsers() {
  const users = readJson(STORAGE_KEYS.users, null);
  if (users) return users;

  const seeded = LOCAL_USERS.map(({ id, email, password, name }) => ({
    id,
    email,
    password,
    name,
  }));
  writeJson(STORAGE_KEYS.users, seeded);
  return seeded;
}

function ensureIdeas() {
  const ideas = readJson(STORAGE_KEYS.ideas, null);
  if (ideas) return ideas;

  const seeded = INITIAL_IDEAS.map((idea) => ({ ...idea }));
  writeJson(STORAGE_KEYS.ideas, seeded);
  return seeded;
}

export async function getCurrentUser() {
  const sessionId = readJson(STORAGE_KEYS.session, null);
  if (!sessionId) return null;

  const user = ensureUsers().find((item) => item.id === sessionId);
  return user ? toPublicUser(user) : null;
}

export function subscribeToAuthChanges(onUserChange) {
  authListeners.add(onUserChange);
  return {
    data: {
      subscription: {
        unsubscribe() {
          authListeners.delete(onUserChange);
        },
      },
    },
  };
}

export async function loginWithEmail(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = ensureUsers().find(
    (item) =>
      item.email.toLowerCase() === normalized && item.password === password,
  );

  if (!user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  writeJson(STORAGE_KEYS.session, user.id);
  const profile = toPublicUser(user);
  notifyAuth(profile);
  return { user: profile };
}

export async function signupWithEmail({ email, password, name }) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedEmail) return { error: "이메일을 입력해주세요." };
  if (!trimmedName) return { error: "이름을 입력해주세요." };
  if (password.length < 4) {
    return { error: "비밀번호는 4자 이상 입력해주세요." };
  }

  const users = ensureUsers();
  if (users.some((item) => item.email.toLowerCase() === trimmedEmail)) {
    return { error: "이미 가입된 이메일입니다." };
  }

  const id = Math.max(0, ...users.map((item) => item.id)) + 1;
  const user = {
    id,
    email: trimmedEmail,
    password,
    name: trimmedName,
  };

  users.push(user);
  writeJson(STORAGE_KEYS.users, users);
  writeJson(STORAGE_KEYS.session, user.id);

  const profile = toPublicUser(user);
  notifyAuth(profile);
  return { user: profile };
}

export async function logout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  notifyAuth(null);
}

export async function fetchIdeasByAuthor(authorId) {
  return ensureIdeas()
    .filter((idea) => idea.authorId === authorId)
    .sort((a, b) => b.id - a.id);
}

export async function createIdea(authorId, { category, title, description }) {
  const ideas = ensureIdeas();
  const id = Math.max(0, ...ideas.map((idea) => idea.id)) + 1;
  const created = { id, authorId, category, title, description };

  ideas.push(created);
  writeJson(STORAGE_KEYS.ideas, ideas);
  return created;
}

export async function updateIdea(
  ideaId,
  { category, title, description, authorId },
) {
  const ideas = ensureIdeas();
  const index = ideas.findIndex(
    (idea) => idea.id === ideaId && idea.authorId === authorId,
  );

  if (index < 0) {
    throw new Error("수정할 아이디어를 찾을 수 없습니다.");
  }

  const updated = {
    ...ideas[index],
    category,
    title,
    description,
  };
  ideas[index] = updated;
  writeJson(STORAGE_KEYS.ideas, ideas);
  return updated;
}

export async function deleteIdea(ideaId, authorId) {
  const ideas = ensureIdeas();
  const next = ideas.filter(
    (idea) => !(idea.id === ideaId && idea.authorId === authorId),
  );

  if (next.length === ideas.length) {
    throw new Error("삭제할 아이디어를 찾을 수 없습니다.");
  }

  writeJson(STORAGE_KEYS.ideas, next);
}
