import { DEMO_USER_ID, TEST_USER_ID } from "./users.js";

/**
 * 로컬 모드 시드 아이디어 (localStorage 초기값)
 * Supabase 시드 SQL: supabase/schema.sql
 */
const DEMO_INITIAL_IDEAS = [
  {
    id: 1,
    authorId: DEMO_USER_ID,
    category: "AI",
    title: "AI 에이전트 추론 비용 절감 플랫폼",
    description:
      "생성형 AI가 에이전트 중심 추론 단계로 전환되며 폭증하는 토큰 비용을 분석하고, 모델·인프라 조합을 최적화해 운영비를 줄이는 도구.",
  },
  {
    id: 2,
    authorId: DEMO_USER_ID,
    category: "반도체",
    title: "HBM 수급 예측 대시보드",
    description:
      "AI 데이터센터 수요 급증으로 심화된 HBM 공급 부족을 장기공급계약(LTA)과 팹 증설 리드타임 데이터로 예측·대응.",
  },
  {
    id: 3,
    authorId: DEMO_USER_ID,
    category: "에너지",
    title: "AI 데이터센터 전력 수요 예측",
    description:
      "AI 칩 공급 확대에 따른 데이터센터 전력·냉각 수요를 지역별로 예측해 인프라 투자와 운영 계획을 지원.",
  },
  {
    id: 4,
    authorId: DEMO_USER_ID,
    category: "바이오",
    title: "AI 기반 신약 후보물질 스크리닝",
    description:
      "단백질 구조 예측과 생성 AI를 결합해 신약 후보 물질을 빠르게 선별하고 실험 우선순위를 제안.",
  },
  {
    id: 5,
    authorId: DEMO_USER_ID,
    category: "AI",
    title: "온디바이스 AI 추론 가속",
    description:
      "클라우드 의존을 줄이기 위해 PC·엣지 기기에서 AI 추론을 경량화하고, 칩플레이션에 따른 비용 부담을 완화.",
  },
  {
    id: 6,
    authorId: DEMO_USER_ID,
    category: "반도체",
    title: "CoWoS 패키징 수율 모니터링",
    description:
      "AI 칩 공급 병목인 CoWoS 첨단 패키징 공정 데이터를 수집·분석해 수율 저하 원인을 조기에 탐지.",
  },
  {
    id: 7,
    authorId: DEMO_USER_ID,
    category: "기타",
    title: "칩플레이션 영향 시뮬레이터",
    description:
      "메모리 가격 급등이 전자제품·클라우드 비용과 사업 계획에 미치는 파급효과를 시나리오별로 시뮬레이션.",
  },
];

const TEST_INITIAL_IDEAS = [
  {
    id: 8,
    authorId: TEST_USER_ID,
    category: "AI",
    title: "RAG 답변 품질 자동 평가",
    description:
      "검색 증강 생성(RAG) 파이프라인의 환각·근거 일치도를 자동 채점해 프롬프트와 인덱스 품질을 개선.",
  },
  {
    id: 9,
    authorId: TEST_USER_ID,
    category: "반도체",
    title: "EUV 공정 변동성 분석",
    description:
      "EUV 노광 공정 파라미터와 수율 데이터를 연계해 lot별 변동 원인을 추적하고 재작업을 줄이는 분석 도구.",
  },
  {
    id: 10,
    authorId: TEST_USER_ID,
    category: "에너지",
    title: "풍력·태양광 출력 단기 예측",
    description:
      "기상·계통 데이터를 결합해 재생에너지 발전량을 시간 단위로 예측하고 ESS 충방전 계획을 지원.",
  },
  {
    id: 11,
    authorId: TEST_USER_ID,
    category: "바이오",
    title: "CRISPR off-target 예측",
    description:
      "유전자 편집 타깃 서열과 유사 서열을 비교해 off-target 위험을 점수화하고 실험 설계를 보조.",
  },
  {
    id: 12,
    authorId: TEST_USER_ID,
    category: "AI",
    title: "멀티모달 논문 요약 파이프라인",
    description:
      "PDF·표·그림을 함께 읽어 연구 논문의 핵심 주장과 실험 결과를 구조화된 요약으로 제공.",
  },
  {
    id: 13,
    authorId: TEST_USER_ID,
    category: "기타",
    title: "공급망 리스크 조기 경보",
    description:
      "원자재 가격·운송 지연·지정학 이벤트 신호를 모니터링해 부품 수급 리스크를 사전에 알림.",
  },
  {
    id: 14,
    authorId: TEST_USER_ID,
    category: "AI",
    title: "소형 LLM 지식 증류 키트",
    description:
      "대형 모델의 응답을 교사 신호로 활용해 도메인 특화 소형 모델을 학습·배포하는 워크플로.",
  },
];

export const INITIAL_IDEAS = [...DEMO_INITIAL_IDEAS, ...TEST_INITIAL_IDEAS];
