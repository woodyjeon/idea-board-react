function Card({ idea, isEditing, isFlashing, onEdit, onDelete }) {
  const { id, category, title, description } = idea;

  return (
    <article
      className={`card ${isEditing ? "card--editing" : ""} ${isFlashing ? "card--success" : ""}`}
    >
      {isEditing && <span className="card-editing-badge">수정 중</span>}
      <span className="card-category">{category}</span>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>
      {!isEditing && (
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
