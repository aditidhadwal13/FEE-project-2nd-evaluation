function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDestructive = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container">
        <div className="modal-header">
          <span className="modal-icon">{isDestructive ? "⚠️" : "ℹ️"}</span>
          <h3 id="modal-title">{title}</h3>
        </div>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDestructive ? "delete-button" : "primary-button"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
