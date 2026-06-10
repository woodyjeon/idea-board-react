import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import CategoryFilter from "./CategoryFilter";

function SortBar({
  categories,
  sortOrder,
  onSortChange,
  categoryFilter,
  onCategoryFilterChange,
}) {
  return (
    <section className="board-filter-bar" aria-label="아이디어 필터 및 정렬">
      <div className="board-filter-bar__group board-filter-bar__group--category">
        <CategoryFilter
          categories={categories}
          selected={categoryFilter}
          onSelect={onCategoryFilterChange}
          showAll
        />
      </div>
      <div className="board-filter-bar__group board-filter-bar__group--sort">
        <div className="sort-bar-actions">
          <button
            type="button"
            className={`sort-btn ${sortOrder === "asc" ? "active" : ""}`}
            onClick={() => onSortChange("asc")}
            aria-label="제목 오름차순"
            title="제목 오름차순"
          >
            <ArrowUpAZ size={18} />
          </button>
          <button
            type="button"
            className={`sort-btn ${sortOrder === "desc" ? "active" : ""}`}
            onClick={() => onSortChange("desc")}
            aria-label="제목 내림차순"
            title="제목 내림차순"
          >
            <ArrowDownAZ size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default SortBar;
