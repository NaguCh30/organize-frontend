import "./Modal.css";

export default function Modal({
    title,
    children,
    onClose,
    onConfirm,
    confirmText = "Save",
    cancelText = "Cancel"
}) {

    return (

        <div className="modal-overlay">

            <div className="modal-container">

                <div className="modal-header">

                    <h2>{title}</h2>

                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                <div className="modal-body">

                    {children}

                </div>

                <div className="modal-footer">

                    <button
                        className="secondary-btn"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="primary-btn"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>

    );

}