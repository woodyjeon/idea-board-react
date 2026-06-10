# 아이디어 스파크보드

아이디어를 기록하고, 분야별로 탐색할 수 있는 React 기반 아이디어 보드입니다.

**Live Demo:** [https://idea-board-react-five.vercel.app/](https://idea-board-react-five.vercel.app/)

## 주요 기능

### 아이디어 관리
- 새 아이디어 등록 (제목, 분야, 설명)
- 카드에서 **수정** · **삭제** (본인 글만)
- 카드 클릭 시 **읽기** 모드
- 수정 시 폼으로 자동 스크롤 + 제목 입력 포커스
- 등록·수정 완료 시 카드 하이라이트 피드백

### 로그인 · 권한
- Supabase Auth (이메일/비밀번호)
- 로그인한 사용자별 아이디어 목록 표시
- 본인이 작성한 글만 등록·수정·삭제

### 분야 · 필터 · 정렬
- 분야별 필터 (전체 / AI / 바이오 / 반도체 / 에너지 / 기타)
- 제목 기준 오름차순 · 내림차순 정렬

### 목록 · 페이지네이션
- 카드 그리드 (데스크톱 3열 / 태블릿 2열 / 모바일 1열)
- 페이지당 9개 표시, 이전 · 다음 탐색

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite 8 |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| 스타일 | CSS (커스텀) |
| 아이콘 | [Lucide React](https://lucide.dev/) |
| 배포 | [Vercel](https://vercel.com/) |

## 시작하기

### 요구 사항
- Node.js 18+
- npm
- Supabase 프로젝트 (DB 연동 모드만 해당)

### 실행 모드

| 모드 | 설정 | 설명 |
|------|------|------|
| **local** | `VITE_DATA_MODE=local` 또는 Supabase env 없음 | localStorage, DB 불필요 |
| **supabase** | Supabase env 설정 (기본) | Auth + PostgreSQL |

### 1. Supabase 설정 (supabase 모드만)

1. [Supabase](https://supabase.com/)에서 프로젝트 생성
2. **SQL Editor**에서 `supabase/schema.sql` 전체 실행  
   - 이미 `ideas`만 적용한 프로젝트라면 `supabase/roadmaps.sql`만 추가 실행
3. **Authentication → Providers → Email**에서 **Enable Email provider** 켜기  
   - **Confirm email** 비활성화 (개발·데모용)
4. **Authentication → Users**에서 데모 계정 생성 (또는 앱에서 회원가입)
   - `demo1@example.com` / `demo1234`
   - `demo2@example.com` / `demo1234`
5. **Project Settings → API**에서 URL과 `anon` key 복사

### 2. 환경 변수

```bash
cp .env.example .env
```

`.env` 파일 (`.env.example` 복사 후 값 입력):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key

# DB 없이 테스트할 때
# VITE_DATA_MODE=local
```

Supabase env는 유지한 채 `.env`에 `VITE_DATA_MODE=local`을 넣으면 test1/test2 localStorage 모드로 동작합니다. demo1/demo2 DB 모드로 돌아가려면 해당 줄을 주석 처리하거나 `VITE_DATA_MODE=supabase`로 설정하세요.

| 모드 | 계정 |
|------|------|
| local | `test1@example.com` / `test1234`, `test2@example.com` / `test1234` |
| supabase | `demo1@example.com` / `demo1234`, `demo2@example.com` / `demo1234` |

Vercel 배포 시에도 동일한 환경 변수를 설정하세요.

### 3. 설치 및 실행

```bash
git clone https://github.com/woodyjeon/idea-board-react.git
cd idea-board-react
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 빌드

```bash
npm run build
npm run preview
```

## 프로젝트 구조

```
src/
├── App.jsx
├── context/
│   └── AuthContext.jsx    # Supabase Auth 세션
├── lib/
│   ├── supabase.js        # Supabase 클라이언트
│   ├── dataMode.js        # local / supabase 모드 선택
│   ├── localData.js       # localStorage 구현
│   ├── authApi.js         # 로그인/회원가입
│   ├── ideasApi.js        # 아이디어 CRUD
│   └── ideaPermissions.js
├── data/
│   ├── users.js           # 로컬 모드 시드 + 로그인 데모 안내
│   └── initialIdeas.js    # 로컬 모드 시드 (Supabase는 schema.sql)
└── components/
    └── ...

supabase/
├── schema.sql             # 테이블, RLS, 시드 데이터
└── roadmaps.sql           # 로드맵 테이블만 추가 (기존 DB 마이그레이션)
```

## 데이터베이스

| 테이블 | 설명 |
|--------|------|
| `users` | 숫자 PK, 이메일·이름 (Auth와 이메일로 연동) |
| `ideas` | `author_id` → `users.id` |

RLS로 로그인한 사용자의 이메일과 일치하는 프로필·아이디어만 접근 가능합니다.

## 배포

Vercel `main` 브랜치 push 시 자동 배포됩니다.  
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 환경 변수 설정이 필요합니다.

- **Production:** [https://idea-board-react-five.vercel.app/](https://idea-board-react-five.vercel.app/)
