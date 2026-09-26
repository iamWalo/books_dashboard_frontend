import { createElement, useCallback, useState } from 'react';
import Toast from './Toast';

export default function useFeedback() {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message, title) => {
        setToast({ type, message, title });
    }, []);

    const showSuccess = useCallback((message, title = 'Success') => showToast('success', message, title), [showToast]);
    const showError = useCallback((message, title = 'Action failed') => showToast('error', message, title), [showToast]);
    const dismissToast = useCallback(() => setToast(null), []);

    const toastElement = toast ? createElement(Toast, { ...toast, onClose: dismissToast }) : null;

    return { showSuccess, showError, dismissToast, toastElement };
}
