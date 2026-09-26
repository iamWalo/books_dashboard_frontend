import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './Feedback.css';

export default function ConfirmModal({ isOpen, title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onCancel, loading = false }) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" role="presentation" onClick={loading ? undefined : onCancel}>
            <div className="confirm-modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={(event) => event.stopPropagation()}>
                <div className="confirm-modal-header">
                    <div className="confirm-modal-icon-badge">
                        <AlertTriangle size={22} aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="confirm-modal-title" id="confirm-modal-title">{title}</h2>
                        <p className="confirm-modal-description">{message}</p>
                    </div>
                    <button className="toast-close-btn" type="button" onClick={onCancel} disabled={loading} aria-label="Close confirmation">
                        <X size={18} />
                    </button>
                </div>
                <div className="confirm-modal-actions">
                    <button className="btn-modal-cancel" type="button" onClick={onCancel} disabled={loading}>Cancel</button>
                    <button className="btn-modal-danger" type="button" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
