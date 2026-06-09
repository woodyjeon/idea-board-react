function Card({
  idea,
  canManage,
  isViewing,
  isEditing,
  isFlashing,
  onView,
  onEdit,
  onDelete,
}) {
  const { id, category, title, description } = idea;

  function handleCardClick() {
    if (isEditing) return;
    onView(idea);
  }

  function handleCardKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  }

  return (
    <article
      className={`card ${isViewing ? "card--viewing" : ""} ${isEditing ? "card--editing" : ""} ${isFlashing ? "card--success" : ""}`}
    >
      {isEditing && <span className="card-editing-badge">수정 중</span>}
      {isViewing && !isEditing && (
        <span className="card-viewing-badge">열람 중</span>
      )}
      <div
        className={`card-body ${isEditing ? "" : "card-body--clickable"}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        tabIndex={isEditing ? -1 : 0}
        role={isEditing ? undefined : "button"}
        aria-label={isEditing ? undefined : `${title} 상세 보기`}
      >
        <span className="card-category">{category}</span>
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{description}</p>
      </div>
      {canManage && !isEditing && (
        <div className="card-actions">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onEdit(idea)}
          >
            수정
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onDelete(id)}
          >
            삭제
          </button>
        </div>
      )}
    </article>
  );
}

export default Card;
