import { isLocalDataMode } from "./dataMode";
import * as localData from "./localData";
import { mapUserFromDb } from "./mappers";
import { isSupabaseConfigured, supabase } from "./supabase";

function toAuthErrorMessage(error) {
  const message = error?.message ?? "";

  if (message.includes("Email logins are disabled")) {
    return "Supabase에서 이메일 로그인이 꺼져 있습니다. Authentication → Providers → Email에서 Enable을 켜주세요.";
  }
  if (message.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다. Supabase Authentication → Users에서 demo1@example.com 계정 비밀번호를 demo1234로 재설정해 보세요.";
  }
  if (message.includes("Email address") && message.includes("invalid")) {
    return "Supabase에서 해당 이메일을 사용할 수 없습니다. demo1@example.com 또는 demo2@example.com 을 사용해주세요.";
  }
  if (message.includes("auth_user_id")) {
    return "DB 스키마가 맞지 않습니다. Supabase SQL Editor에서 supabase/schema.sql을 실행해주세요.";
  }
  if (message.includes("row-level security")) {
    return "RLS 오류입니다. Supabase SQL Editor에서 supabase/schema.sql을 다시 실행해주세요.";
  }
  if (message.includes("User already registered")) {
    return "이미 가입된 이메일입니다.";
  }
  if (message.includes("Password should be at least")) {
    return "비밀번호는 4자 이상 입력해주세요.";
  }

  return message || "인증 처리 중 오류가 발생했습니다.";
}

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. .env 파일을 확인하거나 VITE_DATA_MODE=local 을 사용하세요.",
    );
  }
}

async function resolveProfile(authUser, nameForSignup) {
  const { data, error } = await supabase.rpc("ensure_profile", {
    p_name:
      nameForSignup?.trim() ||
      authUser.user_metadata?.name ||
      null,
  });

  if (error) throw error;
  return mapUserFromDb(data);
}

async function getSupabaseCurrentUser() {
  ensureSupabaseConfigured();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  return resolveProfile(session.user);
}

function subscribeToSupabaseAuthChanges(onUserChange) {
  ensureSupabaseConfigured();

  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      onUserChange(null);
      return;
    }

    try {
      const profile = await resolveProfile(session.user);
      onUserChange(profile);
    } catch {
      onUserChange(null);
    }
  });
}

async function loginWithSupabase(email, password) {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) return { error: toAuthErrorMessage(error) };

  try {
    const user = await resolveProfile(data.user);
    return { user };
  } catch (profileError) {
    await supabase.auth.signOut();
    return {
      error:
        profileError.message ||
        "프로필 연결에 실패했습니다. Supabase SQL Editor에서 supabase/schema.sql을 실행해주세요.",
    };
  }
}

async function signupWithSupabase({ email, password, name }) {
  ensureSupabaseConfigured();

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedEmail) return { error: "이메일을 입력해주세요." };
  if (!trimmedName) return { error: "이름을 입력해주세요." };
  if (password.length < 4) {
    return { error: "비밀번호는 4자 이상 입력해주세요." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: { name: trimmedName },
    },
  });

  if (error) return { error: toAuthErrorMessage(error) };
  if (!data.user) return { error: "회원가입에 실패했습니다." };

  if (!data.session) {
    return {
      error:
        "가입 확인이 필요합니다. Supabase 대시보드 → Authentication → Providers → Email에서 Confirm email을 비활성화하세요.",
    };
  }

  try {
    const user = await resolveProfile(data.user, trimmedName);
    return { user };
  } catch (profileError) {
    await supabase.auth.signOut();
    return {
      error:
        profileError.message ||
        "프로필 생성에 실패했습니다. Supabase에서 schema.sql 실행 여부를 확인해주세요.",
    };
  }
}

async function logoutFromSupabase() {
  ensureSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (isLocalDataMode()) return localData.getCurrentUser();
  return getSupabaseCurrentUser();
}

export function subscribeToAuthChanges(onUserChange) {
  if (isLocalDataMode()) {
    return localData.subscribeToAuthChanges(onUserChange);
  }
  return subscribeToSupabaseAuthChanges(onUserChange);
}

export async function loginWithEmail(email, password) {
  if (isLocalDataMode()) return localData.loginWithEmail(email, password);
  return loginWithSupabase(email, password);
}

export async function signupWithEmail(formData) {
  if (isLocalDataMode()) return localData.signupWithEmail(formData);
  return signupWithSupabase(formData);
}

export async function logout() {
  if (isLocalDataMode()) return localData.logout();
  return logoutFromSupabase();
}
