const ROADMAP_YEAR_OFFSET_PAST = 2;
const ROADMAP_YEAR_OFFSET_FUTURE = 2;
export const ROADMAP_VIEW_YEAR_RADIUS = 1;

export function getRoadmapCurrentYear() {
  return new Date().getFullYear();
}

export function getRoadmapYearRange() {
  const current = getRoadmapCurrentYear();
  const years = [];

  for (
    let offset = -ROADMAP_YEAR_OFFSET_PAST;
    offset <= ROADMAP_YEAR_OFFSET_FUTURE;
    offset += 1
  ) {
    years.push(current + offset);
  }

  return years;
}

export function getRoadmapViewYears(centerYear) {
  return [
    centerYear - ROADMAP_VIEW_YEAR_RADIUS,
    centerYear,
    centerYear + ROADMAP_VIEW_YEAR_RADIUS,
  ];
}

export function formatRoadmapViewRange(centerYear) {
  const [start, , end] = getRoadmapViewYears(centerYear);
  return `${start}~${end}년`;
}

export function formatRoadmapToolbarMeta(itemCount, centerYear) {
  return `${itemCount}개 작업 · ${formatRoadmapViewRange(centerYear)}`;
}

export function normalizeRoadmapYear(year) {
  const parsed = Number(year);
  if (!Number.isInteger(parsed)) return getRoadmapCurrentYear();
  return parsed;
}
