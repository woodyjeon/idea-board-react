import {
  DEMO_USER_ID,
  INITIAL_USERS,
  LEGACY_DEMO_EMAIL,
  LEGACY_USER_IDS,
} from "../data/users.js";

const USERS_KEY = "sparkboard_users";
const SESSION_KEY = "sparkboard_session";

function matchesSeedUser(user, seedUser) {
  return (
    user.id === seedUser.id ||
    user.email === seedUser.email ||
    (seedUser.id === DEMO_USER_ID &&
      (user.email === LEGACY_DEMO_EMAIL || user.id === LEGACY_USER_IDS.demo)) ||
    (seedUser.id === INITIAL_USERS[1].id && user.id === LEGACY_USER_IDS.test)
  );
}

function getNextUserId(users) {
  return (
    users.reduce((max, user) => {
      const id = typeof user.id === "number" ? user.id : 0;
      return Math.max(max, id);
    }, 0) + 1
  );
}

function syncSessionWithUsers(users) {
  const session = getSession();
  if (!session) return;

  const matched = users.find((user) => user.email === session.email);
  if (matched) {
    if (matched.id !== session.id) {
      setSession(matched);
    }
    return;
  }

  clearSession();
}

export function ensureDefaultUser() {
  let users = getUsers();

  if (users.length === 0) {
    saveUsers([...INITIAL_USERS]);
    return;
  }

  let changed = false;

  for (const seedUser of INITIAL_USERS) {
    const index = users.findIndex((user) => matchesSeedUser(user, seedUser));

    if (index === -1) {
      users = [...users, seedUser];
      changed = true;
      continue;
    }

    const current = users[index];
    const needsUpdate =
      current.id !== seedUser.id ||
      current.email !== seedUser.email ||
      current.password !== seedUser.password ||
      current.name !== seedUser.name;

    if (needsUpdate) {
      users = [...users];
      users[index] = seedUser;
      changed = true;
    }
  }

  if (changed) {
    saveUsers(users);
  }

  syncSessionWithUsers(getUsers());
}

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }),
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loginUser(email, password) {
  const trimmedEmail = email.trim().toLowerCase();
  const user = getUsers().find(
    (item) =>
      item.email.trim().toLowerCase() === trimmedEmail &&
      item.password === password,
  );

  if (!user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  setSession(sessionUser);
  return { user: sessionUser };
}

export function signupUser({ email, password, name }) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedEmail) return { error: "이메일을 입력해주세요." };
  if (!trimmedName) return { error: "이름을 입력해주세요." };
  if (password.length < 4) {
    return { error: "비밀번호는 4자 이상 입력해주세요." };
  }

  const users = getUsers();
  if (users.some((item) => item.email === trimmedEmail)) {
    return { error: "이미 가입된 이메일입니다." };
  }

  const newUser = {
    id: getNextUserId(users),
    email: trimmedEmail,
    password,
    name: trimmedName,
  };

  saveUsers([...users, newUser]);
  setSession({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
  };
}

export function logoutUser() {
  clearSession();
}
