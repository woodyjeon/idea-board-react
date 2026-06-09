import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AlertDialog from "./AlertDialog";
import CategoryFilter from "./CategoryFilter";

function IdeaForm({
  categories,
  onAdd,
  onAddCategory,
  editingIdea,
  onUpdate,
  onCancelEdit,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [description, setDescription] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const formSectionRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (editingIdea) {
      setTitle(editingIdea.title);
      setCategory(editingIdea.category);
      setDescription(editingIdea.description);
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setTitle("");
    setCategory(categories[0] ?? "");
    setDescription("");
  }, [editingIdea, categories]);

  useLayoutEffect(() => {
    if (!editingIdea || title !== editingIdea.title) return;

    const input = titleInputRef.current;
    if (!input) return;

    input.focus({ preventScroll: true });
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, [editingIdea, title]);

  useEffect(() => {
    if (!showSuccessFlash) return;

    const timer = setTimeout(() => setShowSuccessFlash(false), 1200);
    return () => clearTimeout(timer);
  }, [showSuccessFlash]);

  useEffect(() => {
    if (!categories.includes(category) && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  function handleSubmit(e) {
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
      onUpdate({ ...ideaData, id: editingIdea.id });
      return;
    }

    onAdd({ ...ideaData, id: crypto.randomUUID() });
    setTitle("");
    setCategory(categories[0] ?? "");
    setDescription("");
    setShowSuccessFlash(true);
  }

  return (
    <section className="form-section" ref={formSectionRef}>
      <form
        className={`idea-form ${editingIdea ? "idea-form--editing" : ""} ${showSuccessFlash ? "idea-form--success" : ""}`}
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
            allowAdd
            onAddCategory={onAddCategory}
            onAddError={setAlertMessage}
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
