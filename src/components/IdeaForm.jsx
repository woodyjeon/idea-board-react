import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AlertDialog from "./AlertDialog";
import CategoryFilter from "./CategoryFilter";

function IdeaForm({
  categories,
  viewingIdea,
  editingIdea,
  onAdd,
  onUpdate,
  onCancelView,
  onCancelEdit,
}) {
  const isNew = editingIdea === "new";
  const isEditMode = editingIdea && editingIdea !== "new";
  const isReadMode = viewingIdea && !editingIdea;
  const isOpen = isNew || isEditMode || isReadMode;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [description, setDescription] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const panelRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isNew) {
      setTitle("");
      setCategory(categories[0] ?? "");
      setDescription("");
      return;
    }

    if (isEditMode) {
      setTitle(editingIdea.title);
      setCategory(editingIdea.category);
      setDescription(editingIdea.description);
    }
  }, [editingIdea, isNew, isEditMode, categories]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.requestAnimationFrame(() => {
      if ((isNew || isEditMode) && titleInputRef.current) {
        titleInputRef.current.focus({ preventScroll: true });
      } else if (isReadMode && panelRef.current) {
        panelRef.current.focus({ preventScroll: true });
      }
    });
  }, [isOpen, isNew, isEditMode, isReadMode, viewingIdea, editingIdea]);

  useEffect(() => {
    if (!categories.includes(category) && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setAlertMessage("제목을 입력해주세요.");
      return;
    }

    const ideaData = {
      category,
      title: trimmedTitle,
      description: description.trim(),
    };

    if (isEditMode) {
      await onUpdate({
        ...ideaData,
        id: editingIdea.id,
        authorId: editingIdea.authorId,
      });
      return;
    }

    await onAdd(ideaData);
  }

  function handleCancel() {
    onCancelEdit();
  }

  if (!isOpen) return null;

  if (isReadMode) {
    return (
      <section
        ref={panelRef}
        id="idea-form-panel"
        className="roadmap-form-panel idea-form-panel"
        tabIndex={-1}
        aria-label="아이디어 상세"
      >
        <div className="roadmap-form-panel-inner">
          <div className="roadmap-form-panel-header">
            <div className="roadmap-form-panel-title-wrap">
              <span
                className="roadmap-item-icon roadmap-item-icon--lg"
                aria-hidden="true"
              />
              <h3 className="roadmap-form-panel-title">아이디어 상세</h3>
            </div>
          </div>

          <div className="roadmap-form-panel-body">
            <div className="roadmap-form-field">
              <span className="roadmap-form-label">요약</span>
              <p className="idea-panel-read-text">{viewingIdea.title}</p>
            </div>
            <div className="roadmap-form-field">
              <span className="roadmap-form-label">분야</span>
              <div className="filter-actions">
                <span className="filter-btn active filter-btn--readonly">
                  {viewingIdea.category}
                </span>
              </div>
            </div>
            <div className="roadmap-form-field">
              <span className="roadmap-form-label">설명</span>
              <p className="idea-panel-read-text idea-panel-read-desc">
                {viewingIdea.description || "설명이 없습니다."}
              </p>
            </div>
          </div>

          <div className="roadmap-form-panel-footer">
            <button
              type="button"
              className="roadmap-form-btn roadmap-form-btn--primary"
              onClick={onCancelView}
            >
              닫기
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={panelRef}
      id="idea-form-panel"
      className="roadmap-form-panel idea-form-panel"
      tabIndex={-1}
      aria-label={isNew ? "아이디어 만들기" : "아이디어 수정"}
    >
      <form className="roadmap-form-panel-inner" onSubmit={handleSubmit}>
        <div className="roadmap-form-panel-header">
          <div className="roadmap-form-panel-title-wrap">
            <span
              className="roadmap-item-icon roadmap-item-icon--lg"
              aria-hidden="true"
            />
            <h3 className="roadmap-form-panel-title">
              {isNew ? "아이디어 만들기" : "아이디어 수정"}
            </h3>
          </div>
        </div>

        <div className="roadmap-form-panel-body">
          <div className="roadmap-form-field">
            <label htmlFor="idea-title" className="roadmap-form-label">
              요약
            </label>
            <input
              ref={titleInputRef}
              id="idea-title"
              className="roadmap-form-input roadmap-form-input--title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="아이디어 제목을 입력하세요"
            />
          </div>

          <div className="roadmap-form-field">
            <span className="roadmap-form-label" id="idea-category-label">
              분야
            </span>
            <div
              className="idea-form-category-card"
              role="group"
              aria-labelledby="idea-category-label"
            >
              <CategoryFilter
                categories={categories}
                selected={category}
                onSelect={setCategory}
              />
            </div>
          </div>

          <div className="roadmap-form-field">
            <label htmlFor="idea-description" className="roadmap-form-label">
              설명
            </label>
            <textarea
              id="idea-description"
              className="roadmap-form-textarea"
              rows="3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="아이디어를 간단히 설명하세요 (선택)"
            />
          </div>
        </div>

        <div className="roadmap-form-panel-footer">
          <button
            type="button"
            className="roadmap-form-btn roadmap-form-btn--secondary"
            onClick={handleCancel}
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

export default IdeaForm;
