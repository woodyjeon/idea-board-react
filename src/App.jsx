import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import IdeaForm from "./components/IdeaForm";
import SortBar from "./components/SortBar";
import CardGrid from "./components/CardGrid";
import Pagination from "./components/Pagination";
import ConfirmDialog from "./components/ConfirmDialog";
import ScrollButtons from "./components/ScrollButtons";
import { INITIAL_IDEAS } from "./data/initialIdeas";
import { INITIAL_CATEGORIES } from "./constants/categories";
import { PAGE_SIZE } from "./constants/pagination";

function App() {
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [editingIdea, setEditingIdea] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [flashCardId, setFlashCardId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const paginationRef = useRef(null);
  const preservePaginationScrollRef = useRef(false);
  const paginationScrollYRef = useRef(null);

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

  const totalPages = Math.max(1, Math.ceil(displayedIdeas.length / PAGE_SIZE));

  const paginatedIdeas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return displayedIdeas.slice(start, start + PAGE_SIZE);
  }, [displayedIdeas, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, sortOrder]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!flashCardId) return;

    const index = displayedIdeas.findIndex((idea) => idea.id === flashCardId);
    if (index >= 0) {
      setCurrentPage(Math.floor(index / PAGE_SIZE) + 1);
    }
  }, [flashCardId, displayedIdeas]);

  useLayoutEffect(() => {
    if (!preservePaginationScrollRef.current) return;

    preservePaginationScrollRef.current = false;
    const yBefore = paginationScrollYRef.current;
    if (yBefore == null || !paginationRef.current) return;

    const yAfter = paginationRef.current.getBoundingClientRect().top;
    window.scrollBy({ top: yAfter - yBefore });
  }, [currentPage]);

  function handlePageChange(newPage) {
    paginationScrollYRef.current =
      paginationRef.current?.getBoundingClientRect().top ?? null;
    preservePaginationScrollRef.current = true;
    setCurrentPage(newPage);
  }

  // --- 새 분야 추가 (추후 활성화) ---
  // function handleAddCategory(name) {
  //   const trimmed = name.trim();
  //   if (!trimmed) return "분야 이름을 입력해주세요.";
  //   if (categories.includes(trimmed)) return "이미 등록된 분야입니다.";
  //
  //   setCategories((prev) => [...prev, trimmed]);
  //   return null;
  // }
  // ---

  function handleAddIdea(idea) {
    setIdeas((prev) => [idea, ...prev]);
    setFlashCardId(idea.id);
    setCurrentPage(1);
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
            // onAddCategory={handleAddCategory} // TODO: 새 분야 추가
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
          <div
            className={`card-board ${totalPages > 1 ? "card-board--paged" : ""}`}
          >
            <CardGrid
              ideas={paginatedIdeas}
              editingId={editingIdea?.id ?? null}
              flashCardId={flashCardId}
              onEdit={setEditingIdea}
              onDelete={handleDeleteRequest}
            />
            <div ref={paginationRef} className="pagination-anchor">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
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
      <div className="brand-watermark" aria-hidden="true">
        <img src="/wj_logo.svg" alt="" />
      </div>
      <ScrollButtons />
    </>
  );
}

export default App;
