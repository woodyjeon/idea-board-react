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

export function getRoadmapViewYears(
  centerYear,
  radius = ROADMAP_VIEW_YEAR_RADIUS,
) {
  if (radius <= 0) return [centerYear];

  return [
    centerYear - radius,
    centerYear,
    centerYear + radius,
  ];
}

export function formatRoadmapViewRange(
  centerYear,
  radius = ROADMAP_VIEW_YEAR_RADIUS,
) {
  if (radius <= 0) return `${centerYear}년`;

  const [start, , end] = getRoadmapViewYears(centerYear, radius);
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
