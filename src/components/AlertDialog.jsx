function AlertDialog({ isOpen, title, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="alert-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        <p id="alert-dialog-message" className="confirm-dialog-message">
          {message}
        </p>
        <div className="confirm-dialog-actions confirm-dialog-actions--single">
          <button type="button" className="confirm-btn-ok" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertDialog;
