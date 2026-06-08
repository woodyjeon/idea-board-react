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
    <section className="sort-bar">
      <CategoryFilter
        categories={categories}
        selected={categoryFilter}
        onSelect={onCategoryFilterChange}
        showAll
      />
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
    </section>
  );
}

export default SortBar;
