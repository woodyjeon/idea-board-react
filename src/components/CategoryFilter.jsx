import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

function CategoryFilter({
  categories,
  selected,
  onSelect,
  showAll = false,
  allowAdd = false,
  onAddCategory,
  onAddError,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const inputRef = useRef(null);
  const addWrapRef = useRef(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (!isAdding) return;

    function handlePointerDown(e) {
      if (addWrapRef.current?.contains(e.target)) return;
      setIsAdding(false);
      setNewCategory("");
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isAdding]);

  function handleStartAdd() {
    setIsAdding(true);
    setNewCategory("");
  }

  function handleCancelAdd() {
    setIsAdding(false);
    setNewCategory("");
  }

  function handleSubmitNewCategory() {
    const error = onAddCategory(newCategory);
    if (error) {
      onAddError?.(error);
      return;
    }

    onSelect(newCategory.trim());
    handleCancelAdd();
  }

  function handleInputKeyDown(e) {
    if (e.key === "Escape") {
      handleCancelAdd();
    }
  }

  return (
    <div className="filter-actions">
      {showAll && (
        <button
          type="button"
          className={`filter-btn ${selected === "all" ? "active" : ""}`}
          onClick={() => onSelect("all")}
        >
          전체
        </button>
      )}
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`filter-btn ${selected === category ? "active" : ""}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
      {allowAdd && (
        <div className="filter-add-wrap" ref={addWrapRef}>
          {isAdding ? (
            <div className="filter-category-field">
              <input
                ref={inputRef}
                type="text"
                className="filter-category-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="새 분야 이름"
                aria-label="새 분야 입력"
              />
              <button
                type="button"
                className="filter-category-submit"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSubmitNewCategory}
              >
                등록
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="filter-btn-add"
              onClick={handleStartAdd}
              aria-label="새 분야 추가"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>분야 추가</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;
