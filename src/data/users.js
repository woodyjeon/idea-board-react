/**
 * 초기 사용자 시드 데이터
 *
 * 추후 DB users 테이블로 이전 예정
 * | column   | type    | note              |
 * |----------|---------|-------------------|
 * | id       | integer | PK, auto increment|
 * | email    | string  | unique, lowercase |
 * | password | string  | 추후 hash 저장    |
 * | name     | string  | 표시 이름         |
 */
export const INITIAL_USERS = [
  {
    id: 1,
    email: "demo@demo.com",
    password: "demo1234",
    name: "데모",
  },
  {
    id: 2,
    email: "test@test.com",
    password: "test1234",
    name: "테스트",
  },
];

export const DEMO_USER_ID = 1;
export const TEST_USER_ID = 2;

/** 이메일 변경 전 데모 계정 (localStorage 마이그레이션용) */
export const LEGACY_DEMO_EMAIL = "demo@sparkboard.local";

/** 문자열 id 사용 시 localStorage 마이그레이션용 */
export const LEGACY_USER_IDS = {
  demo: "demo-user",
  test: "test-user",
};
