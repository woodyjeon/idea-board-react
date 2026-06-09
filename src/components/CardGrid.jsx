import Card from "./Card";

function CardGrid({
  ideas,
  viewingId,
  editingId,
  flashCardId,
  onView,
  onEdit,
  onDelete,
}) {
  if (ideas.length === 0) {
    return (
      <section className="card-grid card-grid-empty">
        <p>해당 분야의 아이디어가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="card-grid">
      {ideas.map((idea) => (
        <Card
          key={idea.id}
          idea={idea}
          isViewing={idea.id === viewingId}
          isEditing={idea.id === editingId}
          isFlashing={idea.id === flashCardId}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export default CardGrid;
