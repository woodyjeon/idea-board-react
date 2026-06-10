import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  formatRoadmapPeriodWithYear,
  formatRoadmapShortPeriod,
  getGanttTodayPosition,
  getRoadmapBarTone,
  getRoadmapMultiYearGridColumn,
  getRoadmapTimelineMonthLabels,
  getTaskProgress,
  getTaskStatus,
  JIRA_MONTH_ABBRS,
  ROADMAP_MONTH_LABELS,
  ROADMAP_MONTHS_PER_YEAR,
} from "../constants/roadmapMonths";
import { useGanttDragNavigation } from "../hooks/useGanttDragNavigation";
import { useMediaQuery } from "../hooks/useMediaQuery";
import GanttTaskActionMenu from "./GanttTaskActionMenu";

function GanttChart({
  items,
  centerYear,
  viewYears,
  editingId,
  onEdit,
  onDelete,
  onShiftYear,
}) {
  const isCompactGantt = useMediaQuery("(max-width: 959px)");
  const [actionItem, setActionItem] = useState(null);
  const monthCount = viewYears.length * ROADMAP_MONTHS_PER_YEAR;
  const timelineMonths = getRoadmapTimelineMonthLabels(viewYears);
  const todayPosition = getGanttTodayPosition(viewYears);
  const { scrollRef, dragHandlers } = useGanttDragNavigation({
    centerYear,
    viewYearCount: viewYears.length,
    onShiftYear,
  });

  function openActionMenu(item) {
    setActionItem(item);
  }

  function closeActionMenu() {
    setActionItem(null);
  }

  function handleEditFromMenu() {
    if (!actionItem) return;
    onEdit(actionItem);
    closeActionMenu();
  }

  function handleDeleteFromMenu() {
    if (!actionItem) return;
    onDelete(actionItem.id);
    closeActionMenu();
  }

  return (
    <div
      className="gantt-chart-root gantt-chart-root--jira"
      style={{ "--roadmap-month-count": monthCount }}
    >
      <div
        ref={scrollRef}
        className="gantt-chart-scroll"
        tabIndex={0}
        aria-label="로드맵 타임라인. 드래그하여 좌우로 이동하거나 이전·이후 연도를 볼 수 있습니다."
        {...dragHandlers}
      >
        {todayPosition && (
          <div
            className="gantt-today-marker"
            style={{
              left: `calc(var(--roadmap-sidebar-width) + var(--roadmap-timeline-width) * ${todayPosition.leftPercent} / 100)`,
            }}
            title={todayPosition.label}
            aria-hidden="true"
          />
        )}

        <div className="gantt-chart-header">
          <div className="gantt-sidebar-head">
            <span className="gantt-sidebar-head-label">작업</span>
          </div>
          <div className="gantt-timeline-header">
            <div className="gantt-year-row" aria-hidden="true">
              {viewYears.map((year) => (
                <span key={year} className="gantt-year-cell">
                  {year}
                </span>
              ))}
            </div>
            <div className="gantt-month-row">
              {timelineMonths.map(({ year, month }) => {
                const monthIndex = ROADMAP_MONTH_LABELS.indexOf(month);
                return (
                  <span key={`${year}-${month}`} className="gantt-month-cell">
                    {JIRA_MONTH_ABBRS[monthIndex]}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="gantt-chart-body">
          {items.map((item, rowIndex) => {
            const isEditing = editingId === item.id;
            const isMilestone = item.startMonth === item.endMonth;
            const periodLabel = formatRoadmapPeriodWithYear(
              item.year,
              item.startMonth,
              item.endMonth,
            );
            const shortPeriod = formatRoadmapShortPeriod(
              item.startMonth,
              item.endMonth,
            );
            const gridColumn = getRoadmapMultiYearGridColumn(
              item.year,
              item.startMonth,
              item.endMonth,
              viewYears,
            );
            const progress = getTaskProgress(item);
            const status = getTaskStatus(item);
            const barTone = getRoadmapBarTone(item.id);
            const barInteractiveProps = isCompactGantt
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": `${item.title}, ${periodLabel}. 탭하여 수정 또는 삭제`,
                  onClick: (event) => {
                    event.stopPropagation();
                    openActionMenu(item);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openActionMenu(item);
                    }
                  },
                }
              : {};

            return (
              <div
                key={item.id}
                className={`gantt-chart-row ${rowIndex % 2 === 1 ? "gantt-chart-row--alt" : ""} ${isEditing ? "gantt-chart-row--editing" : ""}`}
              >
                <div className="gantt-sidebar-cell">
                  <span className="roadmap-item-icon" aria-hidden="true" />
                  <div className="gantt-task-main">
                    <span
                      className="gantt-task-title"
                      title={item.description || item.title}
                    >
                      {item.title}
                    </span>
                    <div className="gantt-task-progress" aria-hidden="true">
                      <span
                        className={`gantt-task-progress-fill ${barTone}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className={`gantt-status-badge ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="gantt-task-period">{shortPeriod}</span>
                  <div className="gantt-task-actions">
                    <button
                      type="button"
                      className="gantt-action-btn"
                      onClick={() => onEdit(item)}
                      aria-label={`${item.title} 수정`}
                      title="수정"
                    >
                      <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="gantt-action-btn gantt-action-btn--danger"
                      onClick={() => onDelete(item.id)}
                      aria-label={`${item.title} 삭제`}
                      title="삭제"
                    >
                      <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="gantt-timeline-row">
                  <div className="gantt-grid-bg" aria-hidden="true">
                    {timelineMonths.map(({ year, month }) => (
                      <span
                        key={`${year}-${month}`}
                        className={`gantt-grid-cell ${month === "1월" ? "gantt-grid-cell--year-start" : ""} ${month === "12월" ? "gantt-grid-cell--year-end" : ""}`}
                      />
                    ))}
                  </div>
                  {gridColumn && (
                    <div
                      className={`gantt-bar ${barTone} ${isMilestone ? "gantt-bar--milestone" : ""} ${isCompactGantt ? "gantt-bar--interactive" : ""}`}
                      style={{ gridColumn }}
                      title={periodLabel}
                      {...barInteractiveProps}
                    >
                      {!isMilestone && (
                        <span className="gantt-bar-label">{item.title}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {actionItem && isCompactGantt && (
        <GanttTaskActionMenu
          item={actionItem}
          onEdit={handleEditFromMenu}
          onDelete={handleDeleteFromMenu}
          onClose={closeActionMenu}
        />
      )}
    </div>
  );
}

export default GanttChart;
