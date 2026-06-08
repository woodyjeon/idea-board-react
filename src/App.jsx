import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import IdeaForm from "./components/IdeaForm";
import SortBar from "./components/SortBar";
import CardGrid from "./components/CardGrid";
import ConfirmDialog from "./components/ConfirmDialog";
import { INITIAL_IDEAS } from "./data/initialIdeas";
import { INITIAL_CATEGORIES } from "./constants/categories";

function App() {
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [editingIdea, setEditingIdea] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [flashCardId, setFlashCardId] = useState(null);

  const deleteTarget = ideas.find((idea) => idea.id === deleteTargetId);

  useEffect(() => {
    if (!flashCardId) return;

    const timer = setTimeout(() => setFlashCardId(null), 1200);
    return () => clearTimeout(timer);
  }, [flashCardId]);

  const displayedIdeas = useMemo(() => {
    let result =
      categoryFilter === "all"
        ? ideas
        : ideas.filter((idea) => idea.category === categoryFilter);

    if (!sortOrder) return result;

    return [...result].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, "ko");
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [ideas, categoryFilter, sortOrder]);

  function handleAddCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return "분야 이름을 입력해주세요.";
    if (categories.includes(trimmed)) return "이미 등록된 분야입니다.";

    setCategories((prev) => [...prev, trimmed]);
    return null;
  }

  function handleAddIdea(idea) {
    setIdeas((prev) => [idea, ...prev]);
    setFlashCardId(idea.id);
  }

  function handleUpdateIdea(updatedIdea) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)),
    );
    setEditingIdea(null);
    setFlashCardId(updatedIdea.id);
  }

  function handleDeleteRequest(id) {
    setDeleteTargetId(id);
  }

  function handleConfirmDelete() {
    if (!deleteTargetId) return;

    setIdeas((prev) => prev.filter((idea) => idea.id !== deleteTargetId));
    if (editingIdea?.id === deleteTargetId) {
      setEditingIdea(null);
    }
    setDeleteTargetId(null);
  }

  function handleCancelDelete() {
    setDeleteTargetId(null);
  }

  return (
    <>
      <Header />
      <main>
        <div className="board-content">
          <IdeaForm
            categories={categories}
            onAdd={handleAddIdea}
            onAddCategory={handleAddCategory}
            editingIdea={editingIdea}
            onUpdate={handleUpdateIdea}
            onCancelEdit={() => setEditingIdea(null)}
          />
          <SortBar
            categories={categories}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
          />
          <CardGrid
            ideas={displayedIdeas}
            editingId={editingIdea?.id ?? null}
            flashCardId={flashCardId}
            onEdit={setEditingIdea}
            onDelete={handleDeleteRequest}
          />
        </div>
      </main>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="아이디어 삭제"
        message={`"${deleteTarget?.title}"을(를) 삭제할까요?`}
        subMessage="이 작업은 되돌릴 수 없습니다."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

export default App;
