function ConfirmDialog({ isOpen, title, message, subMessage, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        <div id="confirm-dialog-message">
          <p className="confirm-dialog-message">{message}</p>
          {subMessage && <p className="confirm-dialog-message">{subMessage}</p>}
        </div>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-btn-cancel" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="confirm-btn-delete" onClick={onConfirm}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
