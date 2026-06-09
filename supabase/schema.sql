-- ============================================================
-- 아이디어 스파크보드 — Supabase DB 설정 (이 파일만 실행)
-- SQL Editor: https://supabase.com/dashboard/project/druqfgwiemrtizwjetfs/sql/new
--
-- 사전 설정 (대시보드):
--   Authentication → Providers → Email → Enable ON, Confirm email OFF
--   Authentication → Users → demo1@example.com / demo1234 (Auto Confirm)
--                         demo2@example.com / demo1234 (Auto Confirm)
-- ============================================================

-- 1. 테이블
create table if not exists public.users (
  id serial primary key,
  email text unique not null,
  password text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id serial primary key,
  author_id integer not null references public.users (id) on delete cascade,
  category text not null,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists ideas_author_id_idx on public.ideas (author_id);

-- 2. 로그인 시 프로필 조회/생성 (RLS 우회)
create or replace function public.ensure_profile(p_name text default null)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_row public.users;
  v_name text;
begin
  if v_email = '' then
    raise exception 'Authenticated email required';
  end if;

  v_name := coalesce(
    nullif(trim(p_name), ''),
    nullif(trim(auth.jwt() -> 'user_metadata' ->> 'name'), ''),
    split_part(v_email, '@', 1),
    '사용자'
  );

  select * into v_row from public.users where lower(email) = v_email limit 1;
  if found then return v_row; end if;

  insert into public.users (email, password, name)
  values (
    v_email,
    case v_email
      when 'demo1@example.com' then 'demo1234'
      when 'demo2@example.com' then 'demo1234'
      else 'auth-managed'
    end,
    v_name
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.ensure_profile(text) from public;
grant execute on function public.ensure_profile(text) to authenticated;

-- 3. RLS (이메일 기준 — Supabase Auth와 연동)
alter table public.users enable row level security;
alter table public.ideas enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_link_seed_profile" on public.users;
drop policy if exists "ideas_select_own" on public.ideas;
drop policy if exists "ideas_insert_own" on public.ideas;
drop policy if exists "ideas_update_own" on public.ideas;
drop policy if exists "ideas_delete_own" on public.ideas;

create policy "users_select_own"
  on public.users for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "ideas_select_own"
  on public.ideas for select
  using (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "ideas_insert_own"
  on public.ideas for insert
  with check (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "ideas_update_own"
  on public.ideas for update
  using (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

create policy "ideas_delete_own"
  on public.ideas for delete
  using (
    author_id in (
      select id from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- 4. 시드 사용자 (id 1=demo1, 2=demo2)
insert into public.users (id, email, password, name)
values
  (1, 'demo1@example.com', 'demo1234', 'demo1'),
  (2, 'demo2@example.com', 'demo1234', 'demo2')
on conflict (id) do update
set email = excluded.email, password = excluded.password, name = excluded.name;

select setval(
  pg_get_serial_sequence('public.users', 'id'),
  greatest((select max(id) from public.users), 1)
);

-- 5. 시드 아이디어
insert into public.ideas (id, author_id, category, title, description)
values
  (1, 1, 'AI', 'AI 에이전트 추론 비용 절감 플랫폼', '생성형 AI가 에이전트 중심 추론 단계로 전환되며 폭증하는 토큰 비용을 분석하고, 모델·인프라 조합을 최적화해 운영비를 줄이는 도구.'),
  (2, 1, '반도체', 'HBM 수급 예측 대시보드', 'AI 데이터센터 수요 급증으로 심화된 HBM 공급 부족을 장기공급계약(LTA)과 팹 증설 리드타임 데이터로 예측·대응.'),
  (3, 1, '에너지', 'AI 데이터센터 전력 수요 예측', 'AI 칩 공급 확대에 따른 데이터센터 전력·냉각 수요를 지역별로 예측해 인프라 투자와 운영 계획을 지원.'),
  (4, 1, '바이오', 'AI 기반 신약 후보물질 스크리닝', '단백질 구조 예측과 생성 AI를 결합해 신약 후보 물질을 빠르게 선별하고 실험 우선순위를 제안.'),
  (5, 1, 'AI', '온디바이스 AI 추론 가속', '클라우드 의존을 줄이기 위해 PC·엣지 기기에서 AI 추론을 경량화하고, 칩플레이션에 따른 비용 부담을 완화.'),
  (6, 1, '반도체', 'CoWoS 패키징 수율 모니터링', 'AI 칩 공급 병목인 CoWoS 첨단 패키징 공정 데이터를 수집·분석해 수율 저하 원인을 조기에 탐지.'),
  (7, 1, '기타', '칩플레이션 영향 시뮬레이터', '메모리 가격 급등이 전자제품·클라우드 비용과 사업 계획에 미치는 파급효과를 시나리오별로 시뮬레이션.'),
  (8, 2, 'AI', 'RAG 답변 품질 자동 평가', '검색 증강 생성(RAG) 파이프라인의 환각·근거 일치도를 자동 채점해 프롬프트와 인덱스 품질을 개선.'),
  (9, 2, '반도체', 'EUV 공정 변동성 분석', 'EUV 노광 공정 파라미터와 수율 데이터를 연계해 lot별 변동 원인을 추적하고 재작업을 줄이는 분석 도구.'),
  (10, 2, '에너지', '풍력·태양광 출력 단기 예측', '기상·계통 데이터를 결합해 재생에너지 발전량을 시간 단위로 예측하고 ESS 충방전 계획을 지원.'),
  (11, 2, '바이오', 'CRISPR off-target 예측', '유전자 편집 타깃 서열과 유사 서열을 비교해 off-target 위험을 점수화하고 실험 설계를 보조.'),
  (12, 2, 'AI', '멀티모달 논문 요약 파이프라인', 'PDF·표·그림을 함께 읽어 연구 논문의 핵심 주장과 실험 결과를 구조화된 요약으로 제공.'),
  (13, 2, '기타', '공급망 리스크 조기 경보', '원자재 가격·운송 지연·지정학 이벤트 신호를 모니터링해 부품 수급 리스크를 사전에 알림.'),
  (14, 2, 'AI', '소형 LLM 지식 증류 키트', '대형 모델의 응답을 교사 신호로 활용해 도메인 특화 소형 모델을 학습·배포하는 워크플로.')
on conflict (id) do update
set author_id = excluded.author_id, category = excluded.category,
    title = excluded.title, description = excluded.description;

select setval(
  pg_get_serial_sequence('public.ideas', 'id'),
  greatest((select max(id) from public.ideas), 1)
);
