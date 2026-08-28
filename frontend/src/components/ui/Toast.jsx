import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    icon: <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />,
  },
  error: {
    bg: 'bg-rose-500/10 border-rose-500/30',
    text: 'text-rose-400',
    icon: <XCircle size={20} className="text-rose-400 shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
    icon: <AlertTriangle size={20} className="text-amber-400 shrink-0" />,
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-400',
    icon: <Info size={20} className="text-blue-400 shrink-0" />,
  },
};

/**
 * Single Toast message
 */
export const Toast = ({ id, message, type = 'success', onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(id), 350);
    }, 4000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, onDismiss]);

  const { bg, text, icon } = VARIANTS[type] || VARIANTS.success;

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md
        ${bg} transition-all duration-350
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {icon}
      <p className={`flex-1 text-sm font-medium ${text}`}>{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(id), 350);
        }}
        className={`${text} opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0`}
      >
        <X size={15} />
      </button>
    </div>
  );
};

/**
 * Toast Container — fixed bottom-right corner
 * Usage: place <ToastContainer toasts={toasts} onDismiss={dismissToast} /> in your component
 */
export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

/**
 * useToast hook — returns { toasts, showToast, dismissToast }
 * showToast(message, type) where type = 'success' | 'error' | 'warning' | 'info'
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, dismissToast };
};

export default Toast;
