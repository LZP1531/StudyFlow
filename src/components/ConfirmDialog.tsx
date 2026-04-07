export function ConfirmDialog(props: {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="confirm-overlay" role="presentation">
      <div className="modal-panel glass soft-panel confirm-modal-panel" role="dialog" aria-modal="true" aria-label={props.title}>
        <div className="confirm-modal-body">
          <p className="eyebrow">{props.title}</p>
          <p className="confirm-modal-description">{props.description}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="ghost-button action-button" onClick={props.onCancel} type="button">
            {props.cancelLabel}
          </button>
          <button
            className={`primary-button action-button ${props.tone === "danger" ? "danger-button" : ""}`.trim()}
            onClick={props.onConfirm}
            type="button"
          >
            {props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
