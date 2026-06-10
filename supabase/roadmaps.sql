-- ============================================================
-- 로드맵 테이블 (Supabase SQL Editor에서 실행)
-- 전제: public.users 테이블·RLS 패턴이 ideas와 동일하게 존재
-- ============================================================

-- 1. 테이블
create table if not exists public.roadmaps (
  id serial primary key,
  author_id integer not null references public.users (id) on delete cascade,
  year integer not null default extract(year from now())::int,
  title text not null,
  description text not null default '',
  start_month smallint not null check (start_month between 1 and 12),
  end_month smallint not null check (end_month between 1 and 12),
  created_at timestamptz not null default now(),
  check (start_month <= end_month)
);

alter table public.roadmaps
  add column if not exists year integer not null default extract(year from now())::int;

create index if not exists roadmaps_author_id_idx on public.roadmaps (author_id);

-- 2. RLS
alter table public.roadmaps enable row level security;

drop policy if exists "roadmaps_select_own" on public.roadmaps;
drop policy if exists "roadmaps_insert_own" on public.roadmaps;
drop policy if exists "roadmaps_update_own" on public.roadmaps;
drop policy if exists "roadmaps_delete_own" on public.roadmaps;

create policy "roadmaps_select_own"
  on public.roadmaps for select
  using (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "roadmaps_insert_own"
  on public.roadmaps for insert
  with check (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "roadmaps_update_own"
  on public.roadmaps for update
  using (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "roadmaps_delete_own"
  on public.roadmaps for delete
  using (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- 3. 더미 데이터 (연도별 일정 예시)
insert into public.roadmaps (id, author_id, year, title, description, start_month, end_month)
values
  (1, 1, extract(year from now())::int, '연간 로드맵 킥오프', '분기별 목표·리소스 배분 워크숍', 1, 1),
  (2, 1, extract(year from now())::int, 'AI 에이전트 추론 비용 절감', '토큰 비용 분석 및 모델·인프라 조합 최적화', 1, 3),
  (3, 1, extract(year from now())::int, '데이터 파이프라인 구축', '수집·정제·대시보드 연동 기반 마련', 2, 4),
  (4, 1, extract(year from now())::int, 'HBM 수급 예측 대시보드', 'LTA·팹 증설 리드타임 데이터 연계', 4, 6),
  (5, 1, extract(year from now())::int, 'RAG 답변 품질 자동 평가', '환각·근거 일치도 자동 채점 파이프라인', 5, 8),
  (6, 1, extract(year from now())::int, '온디바이스 AI POC', '엣지 추론 경량화 프로토타입', 6, 8),
  (7, 1, extract(year from now())::int, 'CoWoS 수율 모니터링', '패키징 공정 이상 징후 조기 탐지', 7, 9),
  (8, 1, extract(year from now())::int, '2분기 성과 리뷰', '마일스톤 점검 및 하반기 계획 조정', 7, 7),
  (9, 1, extract(year from now())::int, '칩플레이션 영향 시뮬레이터', '메모리 가격 시나리오별 비용 모델링', 9, 11),
  (10, 1, extract(year from now())::int, '연말 배포·안정화', '프로덕션 릴리스 및 모니터링 강화', 11, 12),
  (11, 2, extract(year from now())::int, 'EUV 공정 변동성 분석', 'lot별 변동 원인 추적', 2, 5),
  (12, 2, extract(year from now())::int, '재생에너지 출력 예측', 'ESS 충방전 계획 지원', 6, 10),
  (13, 1, extract(year from now())::int - 2, '레거시 시스템 정리', '미사용 서비스·데이터 아카이브', 3, 5),
  (14, 1, extract(year from now())::int - 2, '연말 회고', '연간 성과·교훈 정리 워크숍', 12, 12),
  (15, 1, extract(year from now())::int - 1, '마이크로서비스 전환', '모놀리식 분해 및 API 경계 설계', 1, 6),
  (16, 1, extract(year from now())::int - 1, '보안 감사 대응', '취약점 점검·개선 일정', 9, 10),
  (17, 2, extract(year from now())::int - 1, '공정 데이터 표준화', 'fab·test 데이터 스키마 통일', 4, 7),
  (18, 1, extract(year from now())::int + 1, '차세대 아키텍처 설계', '확장성·비용 목표 정의', 2, 4),
  (19, 1, extract(year from now())::int + 1, '글로벌 PoC 준비', '해외 리전·규제 요건 검토', 8, 11),
  (20, 1, extract(year from now())::int + 2, '글로벌 확장 론칭', '다국어·다리전 서비스 오픈', 1, 3)
on conflict (id) do update
set author_id = excluded.author_id,
    year = excluded.year,
    title = excluded.title,
    description = excluded.description,
    start_month = excluded.start_month,
    end_month = excluded.end_month;

select setval(
  pg_get_serial_sequence('public.roadmaps', 'id'),
  greatest((select max(id) from public.roadmaps), 1)
);
