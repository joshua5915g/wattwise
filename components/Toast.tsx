'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    icon?: string;
    visible: boolean;
    onDismiss: () => void;
}

export default function Toast({ message, icon = '🔄', visible, onDismiss }: ToastProps) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setExiting(false);
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onDismiss, 300);
        }, 2800);
        return () => clearTimeout(timer);
    }, [visible, onDismiss]);

    if (!visible && !exiting) return null;

    return (
        <div
            className="toast"
            style={{
                animation: exiting
                    ? 'toastOut 0.3s ease-in forwards'
                    : 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{message}</span>
            <button
                onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }}
                className="ml-2 opacity-40 hover:opacity-100 transition-opacity text-xs"
                style={{ color: 'var(--text-secondary)' }}
            >
                ✕
            </button>
        </div>
    );
}
