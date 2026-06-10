import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import GanttChart from "../components/GanttChart";
import RoadmapForm from "../components/RoadmapForm";
import { useAuth } from "../context/AuthContext";
import {
  formatRoadmapViewRange,
  getRoadmapCurrentYear,
  getRoadmapViewYears,
  getRoadmapYearRange,
} from "../constants/roadmapYears";
import {
  createRoadmap,
  deleteRoadmap,
  fetchRoadmapsByAuthor,
  updateRoadmap,
} from "../lib/roadmapApi";

function RoadmapPage({ isActive = true, onFormActiveChange }) {
  const { user, isLoggedIn, isLoading: isAuthLoading, openLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedYear, setSelectedYear] = useState(getRoadmapCurrentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const yearOptions = useMemo(() => getRoadmapYearRange(), []);
  const viewYears = useMemo(
    () => getRoadmapViewYears(selectedYear),
    [selectedYear],
  );
  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => viewYears.includes(item.year))
        .sort(
          (a, b) =>
            a.year - b.year || a.startMonth - b.startMonth || a.id - b.id,
        ),
    [items, viewYears],
  );

  const deleteTarget = visibleItems.find((item) => item.id === deleteTargetId);
  const editingId =
    editingItem && editingItem !== "new" ? editingItem.id : null;

  useEffect(() => {
    onFormActiveChange?.(isActive && Boolean(editingItem));
  }, [isActive, editingItem, onFormActiveChange]);

  useEffect(() => {
    if (!user?.id) {
      setItems([]);
      setError("");
      setEditingItem(null);
      return undefined;
    }

    let cancelled = false;

    async function loadRoadmaps() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchRoadmapsByAuthor(user.id);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoadmaps();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function sortItems(list) {
    return [...list].sort(
      (a, b) =>
        a.year - b.year || a.startMonth - b.startMonth || a.id - b.id,
    );
  }

  function handleStartCreate() {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    setEditingItem("new");
  }

  function handleStartEdit(item) {
    setEditingItem(item);
  }

  function handleCancelForm() {
    setEditingItem(null);
  }

  const handleShiftYear = useCallback(
    (delta) => {
      setSelectedYear((prev) => {
        const index = yearOptions.indexOf(prev);
        const nextIndex = index + delta;
        if (nextIndex < 0 || nextIndex >= yearOptions.length) return prev;
        return yearOptions[nextIndex];
      });
    },
    [yearOptions],
  );

  async function handleSubmitForm(payload) {
    if (!user?.id) return;

    try {
      setError("");

      if (editingItem === "new") {
        const created = await createRoadmap(user.id, payload);
        setItems((prev) => sortItems([...prev, created]));
      } else if (editingItem) {
        const saved = await updateRoadmap(editingItem.id, {
          ...payload,
          authorId: user.id,
        });
        setItems((prev) =>
          sortItems(prev.map((item) => (item.id === saved.id ? saved : item))),
        );
      }

      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId || !user?.id) return;

    try {
      setError("");
      await deleteRoadmap(deleteTargetId, user.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteTargetId));
      if (editingItem?.id === deleteTargetId) {
        setEditingItem(null);
      }
      setDeleteTargetId(null);
    } catch (err) {
      setError(err.message);
      setDeleteTargetId(null);
    }
  }

  const emptyMessage = error
    ? error
    : isAuthLoading || loading
      ? "로드맵을 불러오는 중..."
      : isLoggedIn
        ? `${formatRoadmapViewRange(selectedYear)} 구간에 등록된 일정이 없습니다.`
        : "로그인 후 로드맵을 관리할 수 있습니다.";

  return (
    <main className="roadmap-page">
      <div className="roadmap-content">
        <div className="roadmap-toolbar">
          <div className="roadmap-toolbar-left">
            <h2 className="roadmap-toolbar-title">로드맵</h2>
            {isLoggedIn ? (
              <div className="roadmap-toolbar-meta-group">
                <span className="roadmap-meta-pill roadmap-meta-pill--count">
                  <strong>{visibleItems.length}</strong>
                  <span>개 작업</span>
                </span>
                <span className="roadmap-meta-pill roadmap-meta-pill--range">
                  {formatRoadmapViewRange(selectedYear)}
                </span>
              </div>
            ) : (
              <span className="roadmap-toolbar-login-hint">로그인 필요</span>
            )}
          </div>
          {isLoggedIn && (
            <div className="roadmap-toolbar-right">
              <select
                className="roadmap-year-select"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                aria-label="기준 연도"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
              {!editingItem && (
                <button
                  type="button"
                  className="roadmap-add-btn"
                  onClick={handleStartCreate}
                >
                  <Plus size={16} strokeWidth={2} aria-hidden="true" />
                  작업 추가
                </button>
              )}
            </div>
          )}
        </div>

        {!isLoggedIn && !isAuthLoading && (
          <div className="roadmap-login-prompt">
            <p>로그인 후 본인의 연간 로드맵을 관리할 수 있습니다.</p>
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
          <RoadmapForm
            editingItem={editingItem}
            selectedYear={selectedYear}
            yearOptions={yearOptions}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
          />
        )}

        {visibleItems.length === 0 ? (
          <div className="roadmap-empty">{emptyMessage}</div>
        ) : (
          <GanttChart
            items={visibleItems}
            centerYear={selectedYear}
            viewYears={viewYears}
            editingId={editingId}
            onEdit={handleStartEdit}
            onDelete={setDeleteTargetId}
            onShiftYear={handleShiftYear}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="작업 삭제"
        message={`"${deleteTarget?.title}"을(를) 삭제할까요?`}
        subMessage="이 작업은 되돌릴 수 없습니다."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </main>
  );
}

export default RoadmapPage;
