import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import './Feedback.css';

export default function Toast({ type = 'success', title, message, onClose, duration = 4000 }) {
    useEffect(() => {
        if (!onClose || duration <= 0) return undefined;
        const timeout = window.setTimeout(onClose, duration);
        return () => window.clearTimeout(timeout);
    }, [duration, onClose]);

    const Icon = type === 'error' ? AlertCircle : CheckCircle2;

    return (
        <div className="toast-container" role="status" aria-live="polite">
            <div className={`toast-card toast-${type}`}>
                <Icon className="toast-icon" size={20} aria-hidden="true" />
                <div className="toast-content">
                    <p className="toast-title">{title || (type === 'error' ? 'Action failed' : 'Success')}</p>
                    <p className="toast-message">{message}</p>
                </div>
                <button className="toast-close-btn" type="button" onClick={onClose} aria-label="Close notification">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
