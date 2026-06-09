# 아이디어 스파크보드

아이디어를 기록하고, 분야별로 탐색할 수 있는 React 기반 아이디어 보드입니다.

**Live Demo:** [https://idea-board-react-five.vercel.app/](https://idea-board-react-five.vercel.app/)

## 주요 기능

### 아이디어 관리
- 새 아이디어 등록 (제목, 분야, 설명)
- 카드에서 **수정** · **삭제**
- 수정 시 폼으로 자동 스크롤 + 제목 입력 포커스
- 등록·수정 완료 시 카드 하이라이트 피드백

### 분야 · 필터 · 정렬
- 분야별 필터 (전체 / AI / 바이오 / 반도체 / 에너지 / 기타)
- 제목 기준 오름차순 · 내림차순 정렬

### 목록 · 페이지네이션
- 카드 그리드 (데스크톱 3열 / 태블릿 2열 / 모바일 1열)
- 페이지당 9개 표시, 이전 · 다음 탐색
- 페이지 전환 시 스크롤 위치 고정

### UI · UX
- [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) 폰트 (OFL 라이선스)
- 입력 포커스 시 primary 색 테두리
- 우하단 브랜드 워터마크
- 맨 위 / 맨 아래 스크롤 버튼 (우하단)

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite 8 |
| 스타일 | CSS (커스텀) |
| 아이콘 | [Lucide React](https://lucide.dev/) |
| 배포 | [Vercel](https://vercel.com/) |

## 시작하기

### 요구 사항
- Node.js 18+
- npm

### 설치 및 실행

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
npm run preview   # 빌드 결과 미리보기
```

### 린트

```bash
npm run lint
```

## 프로젝트 구조

```
src/
├── App.jsx              # 상태 관리, 필터·정렬·페이지네이션
├── App.css              # 전역·컴포넌트 스타일
├── components/
│   ├── Header.jsx       # 헤더
│   ├── IdeaForm.jsx     # 등록·수정 폼
│   ├── SortBar.jsx      # 분야 필터 + 정렬
│   ├── CategoryFilter.jsx
│   ├── CardGrid.jsx     # 카드 목록
│   ├── Card.jsx
│   ├── Pagination.jsx
│   ├── ScrollButtons.jsx
│   ├── ConfirmDialog.jsx
│   └── AlertDialog.jsx
├── constants/
│   ├── categories.js    # 초기 분야
│   └── pagination.js    # PAGE_SIZE (9)
└── data/
    └── initialIdeas.js  # 초기 샘플 아이디어
```

## 설정

| 파일 | 설명 |
|------|------|
| `src/constants/pagination.js` | `PAGE_SIZE` — 페이지당 카드 수 (기본 9) |
| `src/constants/categories.js` | 초기 분야 목록 |
| `src/data/initialIdeas.js` | 앱 시작 시 표시되는 샘플 아이디어 |

## 배포

Vercel에 연결된 저장소의 `main` 브랜치 push 시 자동 배포됩니다.

- **Production:** [https://idea-board-react-five.vercel.app/](https://idea-board-react-five.vercel.app/)
