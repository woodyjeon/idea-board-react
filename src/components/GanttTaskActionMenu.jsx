import { Pencil, Trash2 } from "lucide-react";
import { formatRoadmapPeriodWithYear, getTaskStatus } from "../constants/roadmapMonths";

function GanttTaskActionMenu({ item, onEdit, onDelete, onClose }) {
  const periodLabel = formatRoadmapPeriodWithYear(
    item.year,
    item.startMonth,
    item.endMonth,
  );
  const status = getTaskStatus(item);

  return (
    <div className="gantt-action-sheet-overlay" onClick={onClose}>
      <div
        className="gantt-action-sheet"
        role="dialog"
        aria-labelledby="gantt-action-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gantt-action-sheet-header">
          <span className="roadmap-item-icon roadmap-item-icon--lg" aria-hidden="true" />
          <div className="gantt-action-sheet-meta">
            <h4 id="gantt-action-sheet-title" className="gantt-action-sheet-title">
              {item.title}
            </h4>
            <p className="gantt-action-sheet-period">{periodLabel}</p>
            <span className={`gantt-status-badge ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>

        {item.description && (
          <p className="gantt-action-sheet-desc">{item.description}</p>
        )}

        <div className="gantt-action-sheet-actions">
          <button type="button" className="gantt-action-sheet-btn" onClick={onEdit}>
            <Pencil size={16} strokeWidth={2} aria-hidden="true" />
            수정
          </button>
          <button
            type="button"
            className="gantt-action-sheet-btn gantt-action-sheet-btn--danger"
            onClick={onDelete}
          >
            <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
            삭제
          </button>
        </div>

        <button type="button" className="gantt-action-sheet-cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
}

export default GanttTaskActionMenu;
