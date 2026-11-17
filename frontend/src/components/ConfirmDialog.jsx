export default function ConfirmDialog({ titulo, texto, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{titulo}</h2>
        <p>{texto}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={onCancel}>
            Volver
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
