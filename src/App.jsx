import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import IdeaForm from "./components/IdeaForm";
import SortBar from "./components/SortBar";
import CardGrid from "./components/CardGrid";
import Pagination from "./components/Pagination";
import ConfirmDialog from "./components/ConfirmDialog";
import ScrollButtons from "./components/ScrollButtons";
import RoadmapPage from "./pages/RoadmapPage";
import { INITIAL_CATEGORIES } from "./constants/categories";
import { PAGE_SIZE } from "./constants/pagination";
import { isIdeaOwner } from "./lib/ideaPermissions";
import {
  createIdea,
  deleteIdea,
  fetchIdeasByAuthor,
  updateIdea,
} from "./lib/ideasApi";

function App() {
  const { user, isLoggedIn, isLoading: isAuthLoading, openLogin } = useAuth();
  const [activePage, setActivePage] = useState("board");
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState("");
  const [categories] = useState(INITIAL_CATEGORIES);
  const [editingIdea, setEditingIdea] = useState(null);
  const [viewingIdea, setViewingIdea] = useState(null);
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

    const timer = setTimeout(() => setFlashCardId(null), 700);
    return () => clearTimeout(timer);
  }, [flashCardId]);

  useEffect(() => {
    if (isLoggedIn) return;

    setEditingIdea(null);
    setViewingIdea(null);
    setIdeas([]);
    setIdeasError("");
  }, [isLoggedIn]);

  useEffect(() => {
    setCurrentPage(1);
    setViewingIdea(null);
    setEditingIdea(null);
  }, [user?.id]);

  useEffect(() => {
    if (
      !editingIdea ||
      editingIdea === "new" ||
      isIdeaOwner(editingIdea, user?.id)
    ) {
      return;
    }

    setEditingIdea(null);
  }, [user?.id, editingIdea]);

  useEffect(() => {
    if (!viewingIdea || isIdeaOwner(viewingIdea, user?.id)) return;

    setViewingIdea(null);
  }, [user?.id, viewingIdea]);

  useEffect(() => {
    if (!user?.id) return undefined;

    let cancelled = false;

    async function loadIdeas() {
      setIdeasLoading(true);
      setIdeasError("");

      try {
        const data = await fetchIdeasByAuthor(user.id);
        if (!cancelled) setIdeas(data);
      } catch (error) {
        if (!cancelled) {
          setIdeas([]);
          setIdeasError(error.message);
        }
      } finally {
        if (!cancelled) setIdeasLoading(false);
      }
    }

    loadIdeas();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const displayedIdeas = useMemo(() => {
    if (!user?.id) return [];

    let result = ideas.filter((idea) => idea.authorId === user.id);

    if (categoryFilter !== "all") {
      result = result.filter((idea) => idea.category === categoryFilter);
    }

    if (!sortOrder) return result;

    return [...result].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, "ko");
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [ideas, categoryFilter, sortOrder, user?.id]);

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

  async function handleAddIdea(ideaData) {
    if (!isLoggedIn || !user) {
      openLogin();
      return;
    }

    try {
      setIdeasError("");
      const created = await createIdea(user.id, ideaData);
      setIdeas((prev) => [created, ...prev]);
      setFlashCardId(created.id);
      setCurrentPage(1);
      setEditingIdea(null);
    } catch (error) {
      setIdeasError(error.message);
    }
  }

  async function handleUpdateIdea(updatedIdea) {
    if (!isLoggedIn || !user) {
      openLogin();
      return;
    }

    const existing = ideas.find((idea) => idea.id === updatedIdea.id);
    if (!existing || !isIdeaOwner(existing, user.id)) return;

    try {
      setIdeasError("");
      const saved = await updateIdea(updatedIdea.id, {
        category: updatedIdea.category,
        title: updatedIdea.title,
        description: updatedIdea.description,
        authorId: user.id,
      });
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === saved.id ? saved : idea)),
      );
      setEditingIdea(null);
      setViewingIdea(null);
      setFlashCardId(saved.id);
    } catch (error) {
      setIdeasError(error.message);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStartCreate() {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    setEditingIdea("new");
    setViewingIdea(null);
  }

  function handleViewIdea(idea) {
    if (!user?.id || !isIdeaOwner(idea, user.id)) return;

    setViewingIdea(idea);
    setEditingIdea(null);
    setFlashCardId(idea.id);
  }

  function handleEditIdea(idea) {
    if (!isLoggedIn || !user) {
      openLogin();
      return;
    }

    if (!isIdeaOwner(idea, user.id)) return;

    setEditingIdea(idea);
    setViewingIdea(null);
    setFlashCardId(idea.id);
  }

  function handleDeleteRequest(id) {
    if (!isLoggedIn || !user) {
      openLogin();
      return;
    }

    const idea = ideas.find((item) => item.id === id);
    if (!idea || !isIdeaOwner(idea, user.id)) return;

    setDeleteTargetId(id);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId || !user) return;

    const idea = ideas.find((item) => item.id === deleteTargetId);
    if (!idea || !isIdeaOwner(idea, user.id)) {
      setDeleteTargetId(null);
      return;
    }

    try {
      setIdeasError("");
      await deleteIdea(deleteTargetId, user.id);
      setIdeas((prev) => prev.filter((item) => item.id !== deleteTargetId));
      if (editingIdea?.id === deleteTargetId) {
        setEditingIdea(null);
      }
      if (viewingIdea?.id === deleteTargetId) {
        setViewingIdea(null);
      }
      setDeleteTargetId(null);
    } catch (error) {
      setIdeasError(error.message);
      setDeleteTargetId(null);
    }
  }

  function handleCancelDelete() {
    setDeleteTargetId(null);
  }

  function handleNavPageChange(page) {
    if (page === "board") {
      setViewingIdea(null);
      setEditingIdea(null);
    }
    setActivePage(page);
  }

  function handleGoHome() {
    setActivePage("board");
    setViewingIdea(null);
    setEditingIdea(null);
    setCategoryFilter("all");
    setSortOrder(null);
    setCurrentPage(1);
    scrollToTop();
  }

  const cardEmptyMessage = ideasError
    ? ideasError
    : isAuthLoading || ideasLoading
      ? "아이디어를 불러오는 중..."
      : isLoggedIn
        ? "해당 분야의 아이디어가 없습니다."
        : "로그인 후 본인의 아이디어를 확인할 수 있습니다.";

  return (
    <div className="app-shell">
      <Header
        activePage={activePage}
        onPageChange={handleNavPageChange}
        onHomeClick={handleGoHome}
      />
      <div className="app-main">
        <main
          className="board-page"
          hidden={activePage !== "board"}
          aria-hidden={activePage !== "board"}
        >
          <div className="board-content">
            <div className="board-toolbar">
              <div className="board-toolbar-left">
                <h2 className="board-toolbar-title">아이디어 보드</h2>
                {isLoggedIn ? (
                  <div className="roadmap-toolbar-meta-group">
                    <span className="roadmap-meta-pill roadmap-meta-pill--count">
                      <strong>{displayedIdeas.length}</strong>
                      <span>개 아이디어</span>
                    </span>
                  </div>
                ) : (
                  <span className="roadmap-toolbar-login-hint">로그인 필요</span>
                )}
              </div>
              {isLoggedIn && !editingIdea && !viewingIdea && (
                <button
                  type="button"
                  className="roadmap-add-btn"
                  onClick={handleStartCreate}
                >
                  <Plus size={16} strokeWidth={2} aria-hidden="true" />
                  아이디어 추가
                </button>
              )}
            </div>

            {!isLoggedIn && !isAuthLoading && (
              <div className="roadmap-login-prompt">
                <p>로그인 후 본인의 아이디어를 등록·수정·삭제할 수 있습니다.</p>
                <button
                  type="button"
                  className="roadmap-add-btn"
                  onClick={openLogin}
                >
                  로그인
                </button>
              </div>
            )}

            {isLoggedIn && (
              <IdeaForm
                categories={categories}
                viewingIdea={viewingIdea}
                editingIdea={editingIdea}
                onAdd={handleAddIdea}
                onUpdate={handleUpdateIdea}
                onCancelView={() => setViewingIdea(null)}
                onCancelEdit={() => setEditingIdea(null)}
              />
            )}

            <div className="board-list-panel">
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
                  currentUserId={user?.id ?? null}
                  emptyMessage={cardEmptyMessage}
                  isLoading={isAuthLoading || ideasLoading}
                  viewingId={viewingIdea?.id ?? null}
                  editingId={
                    editingIdea && editingIdea !== "new" ? editingIdea.id : null
                  }
                  flashCardId={flashCardId}
                  onView={handleViewIdea}
                  onEdit={handleEditIdea}
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
          </div>
        </main>
        <div
          hidden={activePage !== "roadmap"}
          aria-hidden={activePage !== "roadmap"}
        >
          <RoadmapPage />
        </div>
        {activePage === "board" && (
          <>
            <ConfirmDialog
              isOpen={Boolean(deleteTarget)}
              title="아이디어 삭제"
              message={`"${deleteTarget?.title}"을(를) 삭제할까요?`}
              subMessage="이 작업은 되돌릴 수 없습니다."
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
            <ScrollButtons />
          </>
        )}
      <div className="brand-watermark" aria-hidden="true">
        <img src="/wj_logo.svg" alt="" />
      </div>
      </div>
    </div>
  );
}

export default App;
