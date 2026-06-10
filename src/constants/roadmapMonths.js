export const ROADMAP_MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export const ROADMAP_QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];

export const ROADMAP_MONTH_COUNT = ROADMAP_MONTH_LABELS.length;
export const ROADMAP_MONTHS_PER_YEAR = ROADMAP_MONTH_COUNT;
export const ROADMAP_MONTH_COLUMN_WIDTH = 80;
export const ROADMAP_MULTI_YEAR_MONTH_WIDTH = 64;

export const JIRA_MONTH_ABBRS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function clampRoadmapMonth(month) {
  return Math.max(1, Math.min(month, ROADMAP_MONTH_COUNT));
}

export function formatRoadmapPeriod(startMonth, endMonth) {
  const start = clampRoadmapMonth(startMonth);
  const end = clampRoadmapMonth(endMonth);
  if (start === end) return `${start}월`;
  return `${start}월 ~ ${end}월`;
}

export function formatRoadmapPeriodWithYear(year, startMonth, endMonth) {
  return `${year}년 ${formatRoadmapPeriod(startMonth, endMonth)}`;
}

/** CSS grid-column for single-year Gantt bar (1-based, end exclusive) */
export function getRoadmapGridColumn(startMonth, endMonth) {
  const start = clampRoadmapMonth(startMonth);
  const end = clampRoadmapMonth(endMonth);
  return `${start} / ${end + 1}`;
}

/** CSS grid-column for multi-year Gantt bar */
export function getRoadmapMultiYearGridColumn(
  year,
  startMonth,
  endMonth,
  viewYears,
) {
  const yearIndex = viewYears.indexOf(year);
  if (yearIndex < 0) return null;

  const start = yearIndex * ROADMAP_MONTHS_PER_YEAR + clampRoadmapMonth(startMonth);
  const end =
    yearIndex * ROADMAP_MONTHS_PER_YEAR + clampRoadmapMonth(endMonth) + 1;
  return `${start} / ${end}`;
}

export function getRoadmapTimelineMonthLabels(viewYears) {
  return viewYears.flatMap((year) =>
    ROADMAP_MONTH_LABELS.map((month) => ({ year, month })),
  );
}

export function getRoadmapBarTone(id) {
  return `gantt-bar--tone-${(id % 5) + 1}`;
}

export function getGanttTodayPosition(viewYears) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const yearIndex = viewYears.indexOf(year);
  if (yearIndex < 0) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  const dayFraction = (now.getDate() - 0.5) / daysInMonth;
  const monthOffset =
    yearIndex * ROADMAP_MONTHS_PER_YEAR + (month - 1) + dayFraction;
  const totalMonths = viewYears.length * ROADMAP_MONTHS_PER_YEAR;

  return {
    leftPercent: (monthOffset / totalMonths) * 100,
    label: `오늘 · ${month}월 ${now.getDate()}일`,
  };
}

export function getTaskProgress(item) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (year < item.year || (year === item.year && month < item.startMonth)) {
    return 0;
  }
  if (year > item.year || (year === item.year && month > item.endMonth)) {
    return 100;
  }

  const totalMonths = item.endMonth - item.startMonth + 1;
  const elapsed = month - item.startMonth + 1;
  return Math.round((elapsed / totalMonths) * 100);
}

export function getTaskStatus(item) {
  const progress = getTaskProgress(item);
  if (progress === 0) {
    return { label: "예정", className: "gantt-status--todo" };
  }
  if (progress === 100) {
    return { label: "완료", className: "gantt-status--done" };
  }
  return { label: "진행중", className: "gantt-status--progress" };
}

export function formatRoadmapShortPeriod(startMonth, endMonth) {
  const start = clampRoadmapMonth(startMonth);
  const end = clampRoadmapMonth(endMonth);
  if (start === end) return `${start}월`;
  return `${start}~${end}월`;
}
