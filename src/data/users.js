/** 로컬 모드 시드 사용자 (localStorage 초기값) */
export const LOCAL_USERS = [
  {
    id: 1,
    email: "test1@example.com",
    password: "test1234",
    name: "test1",
  },
  {
    id: 2,
    email: "test2@example.com",
    password: "test1234",
    name: "test2",
  },
];

/** Supabase 모드 데모 계정 (로그인 안내용 — DB 시드는 schema.sql) */
export const SUPABASE_DEMO_USERS = [
  {
    id: 1,
    email: "demo1@example.com",
    password: "demo1234",
    name: "demo1",
  },
  {
    id: 2,
    email: "demo2@example.com",
    password: "demo1234",
    name: "demo2",
  },
];

export const DEMO_USER_ID = 1;
export const TEST_USER_ID = 2;
