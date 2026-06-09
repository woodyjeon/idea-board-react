import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="아이디어 페이지">
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={20} strokeWidth={2} />
      </button>
      <span className="pagination-status" aria-live="polite">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight size={20} strokeWidth={2} />
      </button>
    </nav>
  );
}

export default Pagination;
