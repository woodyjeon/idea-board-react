import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AlertDialog from "./AlertDialog";
import CategoryFilter from "./CategoryFilter";

function IdeaForm({
  categories,
  isLoggedIn,
  onLoginRequest,
  onAdd,
  // onAddCategory, // TODO: 새 분야 추가
  viewingIdea,
  editingIdea,
  onUpdate,
  onCancelView,
  onCancelEdit,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [description, setDescription] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [showEditFlash, setShowEditFlash] = useState(false);
  const [showViewFlash, setShowViewFlash] = useState(false);
  const formSectionRef = useRef(null);
  const titleInputRef = useRef(null);
  const prevEditingIdRef = useRef(null);
  const prevViewingIdRef = useRef(null);

  const isReadMode = viewingIdea && !editingIdea;

  useEffect(() => {
    if (isReadMode) {
      if (prevViewingIdRef.current !== viewingIdea.id) {
        setShowViewFlash(true);
      }
      prevViewingIdRef.current = viewingIdea.id;
      return;
    }

    prevViewingIdRef.current = null;

    if (editingIdea) {
      setTitle(editingIdea.title);
      setCategory(editingIdea.category);
      setDescription(editingIdea.description);

      if (prevEditingIdRef.current !== editingIdea.id) {
        setShowEditFlash(true);
      }
      prevEditingIdRef.current = editingIdea.id;
      return;
    }

    prevEditingIdRef.current = null;
    setTitle("");
    setCategory(categories[0] ?? "");
    setDescription("");
  }, [viewingIdea, editingIdea, categories, isReadMode]);

  useLayoutEffect(() => {
    if (!viewingIdea && !editingIdea) return;

    const section = formSectionRef.current;
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });

    window.requestAnimationFrame(() => {
      if (editingIdea && titleInputRef.current && title === editingIdea.title) {
        const input = titleInputRef.current;
        input.focus({ preventScroll: true });
        const end = input.value.length;
        input.setSelectionRange(end, end);
        return;
      }

      if (viewingIdea && !editingIdea) {
        section.focus({ preventScroll: true });
      }
    });
  }, [viewingIdea, editingIdea, title]);

  useEffect(() => {
    if (!showSuccessFlash) return;

    const timer = setTimeout(() => setShowSuccessFlash(false), 1200);
    return () => clearTimeout(timer);
  }, [showSuccessFlash]);

  useEffect(() => {
    if (!showEditFlash) return;

    const timer = setTimeout(() => setShowEditFlash(false), 1200);
    return () => clearTimeout(timer);
  }, [showEditFlash]);

  useEffect(() => {
    if (!showViewFlash) return;

    const timer = setTimeout(() => setShowViewFlash(false), 1200);
    return () => clearTimeout(timer);
  }, [showViewFlash]);

  useEffect(() => {
    if (!categories.includes(category) && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  async function handleSubmit(e) {
    e.preventDefault();

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

    if (editingIdea) {
      await onUpdate({
        ...ideaData,
        id: editingIdea.id,
        authorId: editingIdea.authorId,
      });
      return;
    }

    await onAdd(ideaData);
    setTitle("");
    setCategory(categories[0] ?? "");
    setDescription("");
    setShowSuccessFlash(true);
  }

  if (!isLoggedIn && !isReadMode) {
    return (
      <section className="form-section">
        <div className="idea-form login-prompt">
          <h2 className="form-heading">아이디어 등록</h2>
          <p className="login-prompt-text">
            로그인 후 본인이 작성한 아이디어만 등록·수정·삭제할 수 있습니다.
          </p>
          <button
            type="button"
            className="auth-btn auth-btn--primary login-prompt-btn"
            onClick={onLoginRequest}
          >
            로그인
          </button>
        </div>
      </section>
    );
  }

  if (isReadMode) {
    return (
      <section
        ref={formSectionRef}
        id="idea-form-panel"
        className="form-section"
        tabIndex={-1}
        aria-label="아이디어 상세"
      >
        <div
          className={`idea-form idea-form--reading ${showViewFlash ? "idea-form--success" : ""}`}
        >
          <div className="form-header">
            <h2 className="form-heading">아이디어 상세</h2>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancelView}
              >
                닫기
              </button>
            </div>
          </div>

          <span className="form-label">제목</span>
          <p className="idea-read-text">{viewingIdea.title}</p>

          <span className="form-label">분야</span>
          <span className="filter-btn active idea-read-category">
            {viewingIdea.category}
          </span>

          <span className="form-label">설명</span>
          <p className="idea-read-text idea-read-desc">
            {viewingIdea.description || "설명이 없습니다."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={formSectionRef}
      id="idea-form-panel"
      className="form-section"
      tabIndex={-1}
      aria-label={editingIdea ? "아이디어 수정" : "새 아이디어 등록"}
    >
      <form
        className={`idea-form ${editingIdea ? "idea-form--editing" : ""} ${showSuccessFlash || showEditFlash ? "idea-form--success" : ""}`}
        onSubmit={handleSubmit}
      >
        <div className="form-header">
          <h2 className="form-heading">
            {editingIdea ? "아이디어 수정" : "새 아이디어 등록"}
          </h2>
          <div className="form-actions">
            <button type="submit">{editingIdea ? "수정" : "등록"}</button>
            {editingIdea && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancelEdit}
              >
                취소
              </button>
            )}
          </div>
        </div>

        <label htmlFor="title">제목</label>
        <input
          ref={titleInputRef}
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="아이디어 제목을 입력하세요"
        />

        <span className="form-label" id="category-label">
          분야
        </span>
        <div
          className="sort-bar form-category-bar"
          role="group"
          aria-labelledby="category-label"
        >
          <CategoryFilter
            categories={categories}
            selected={category}
            onSelect={setCategory}
            // allowAdd // TODO: 새 분야 추가
            // onAddCategory={onAddCategory}
            // onAddError={setAlertMessage}
          />
        </div>

        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="아이디어를 간단히 설명하세요"
        />
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
