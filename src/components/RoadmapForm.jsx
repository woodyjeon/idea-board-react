import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AlertDialog from "./AlertDialog";
import {
  formatRoadmapPeriod,
  ROADMAP_MONTH_LABELS,
} from "../constants/roadmapMonths";

function RoadmapForm({
  editingItem,
  selectedYear,
  yearOptions,
  onSubmit,
  onCancel,
}) {
  const isNew = editingItem === "new";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(selectedYear);
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(2);
  const [alertMessage, setAlertMessage] = useState("");
  const panelRef = useRef(null);
  const titleInputRef = useRef(null);

  useLayoutEffect(() => {
    if (!editingItem) return;

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const input = titleInputRef.current;
    if (!input) return;

    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
    });
  }, [editingItem]);

  useEffect(() => {
    if (isNew) {
      setTitle("");
      setDescription("");
      setYear(selectedYear);
      setStartMonth(1);
      setEndMonth(2);
      return;
    }

    if (!editingItem) return;

    setTitle(editingItem.title);
    setDescription(editingItem.description);
    setYear(editingItem.year);
    setStartMonth(editingItem.startMonth);
    setEndMonth(editingItem.endMonth);
  }, [editingItem, isNew, selectedYear]);

  useEffect(() => {
    if (endMonth < startMonth) {
      setEndMonth(startMonth);
    }
  }, [startMonth, endMonth]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setAlertMessage("제목을 입력해주세요.");
      return;
    }

    await onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      year,
      startMonth,
      endMonth,
    });
  }

  if (!editingItem) return null;

  const periodPreview =
    startMonth === endMonth
      ? `${year}년 ${startMonth}월`
      : `${year}년 ${formatRoadmapPeriod(startMonth, endMonth)}`;

  const previewLeft = ((startMonth - 1) / 12) * 100;
  const previewWidth = ((endMonth - startMonth + 1) / 12) * 100;

  return (
    <section
      ref={panelRef}
      id="roadmap-form-panel"
      className="roadmap-form-panel"
      tabIndex={-1}
      aria-label={isNew ? "작업 만들기" : "작업 수정"}
    >
      <form className="roadmap-form-panel-inner" onSubmit={handleSubmit}>
        <div className="roadmap-form-panel-header">
          <div className="roadmap-form-panel-title-wrap">
            <span
              className="roadmap-item-icon roadmap-item-icon--lg"
              aria-hidden="true"
            />
            <h3 className="roadmap-form-panel-title">
              {isNew ? "작업 만들기" : "작업 수정"}
            </h3>
          </div>
        </div>

        <div className="roadmap-form-panel-body">
          <div className="roadmap-form-field">
            <label htmlFor="roadmap-title" className="roadmap-form-label">
              요약
            </label>
            <input
              ref={titleInputRef}
              id="roadmap-title"
              className="roadmap-form-input roadmap-form-input--title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="작업 제목을 입력하세요"
            />
          </div>

          <div className="roadmap-form-field">
            <span className="roadmap-form-label">기간</span>
            <div className="roadmap-form-period-card">
              <div className="roadmap-form-period-fields">
                <div className="roadmap-form-period-field">
                  <label htmlFor="roadmap-year" className="roadmap-form-sublabel">
                    연도
                  </label>
                  <select
                    id="roadmap-year"
                    className="roadmap-form-select"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                  >
                    {yearOptions.map((optionYear) => (
                      <option key={optionYear} value={optionYear}>
                        {optionYear}년
                      </option>
                    ))}
                  </select>
                </div>
                <div className="roadmap-form-period-field">
                  <label
                    htmlFor="roadmap-start-month"
                    className="roadmap-form-sublabel"
                  >
                    시작
                  </label>
                  <select
                    id="roadmap-start-month"
                    className="roadmap-form-select"
                    value={startMonth}
                    onChange={(event) =>
                      setStartMonth(Number(event.target.value))
                    }
                  >
                    {ROADMAP_MONTH_LABELS.map((label, index) => (
                      <option key={label} value={index + 1}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="roadmap-form-period-field">
                  <label
                    htmlFor="roadmap-end-month"
                    className="roadmap-form-sublabel"
                  >
                    종료
                  </label>
                  <select
                    id="roadmap-end-month"
                    className="roadmap-form-select"
                    value={endMonth}
                    onChange={(event) => setEndMonth(Number(event.target.value))}
                  >
                    {ROADMAP_MONTH_LABELS.map((label, index) => {
                      const month = index + 1;
                      if (month < startMonth) return null;
                      return (
                        <option key={label} value={month}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="roadmap-form-timeline-preview">
                <div className="roadmap-form-preview-header">
                  <span className="roadmap-form-preview-label">타임라인</span>
                  <span className="roadmap-form-preview-period">
                    {periodPreview}
                  </span>
                </div>
                <div className="roadmap-form-preview-track" aria-hidden="true">
                  {ROADMAP_MONTH_LABELS.map((month) => (
                    <span key={month} className="roadmap-form-preview-month" />
                  ))}
                  <span
                    className="roadmap-form-preview-bar"
                    style={{
                      left: `${previewLeft}%`,
                      width: `${previewWidth}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="roadmap-form-field">
            <label htmlFor="roadmap-description" className="roadmap-form-label">
              설명
            </label>
            <textarea
              id="roadmap-description"
              className="roadmap-form-textarea"
              rows="3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="설명을 입력하세요 (선택)"
            />
          </div>
        </div>

        <div className="roadmap-form-panel-footer">
          <button
            type="button"
            className="roadmap-form-btn roadmap-form-btn--secondary"
            onClick={onCancel}
          >
            취소
          </button>
          <button type="submit" className="roadmap-form-btn roadmap-form-btn--primary">
            {isNew ? "만들기" : "저장"}
          </button>
        </div>
      </form>

      <AlertDialog
        isOpen={Boolean(alertMessage)}
        title="입력 필요"
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
    </section>
  );
}

export default RoadmapForm;
