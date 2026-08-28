import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle, X } from 'lucide-react';

const VARIANTS = {
  danger: {
    icon: <XCircle size={40} className="text-rose-400" />,
    confirmBtn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/10',
  },
  success: {
    icon: <CheckCircle2 size={40} className="text-emerald-400" />,
    confirmBtn: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
  },
  warning: {
    icon: <AlertTriangle size={40} className="text-amber-400" />,
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10',
  },
  info: {
    icon: <HelpCircle size={40} className="text-blue-400" />,
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
  },
};

/**
 * ConfirmModal
 *
 * Props:
 *  open        – boolean, whether to show
 *  title       – string, dialog title
 *  message     – string, confirmation question
 *  confirmText – string (default "Yes, Confirm")
 *  cancelText  – string (default "No, Go Back")
 *  variant     – 'danger' | 'success' | 'warning' | 'info'  (default 'warning')
 *  onConfirm   – callback when user clicks Yes
 *  onCancel    – callback when user clicks No / closes
 *  loading     – boolean, disables buttons while processing
 */
const ConfirmModal = ({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Yes, Confirm',
  cancelText = 'No, Go Back',
  variant = 'warning',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const { icon, confirmBtn, border, iconBg } = VARIANTS[variant] || VARIANTS.warning;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.80)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      {/* Dialog Box */}
      <div
        className={`relative w-full max-w-sm bg-slate-900 rounded-3xl border ${border} shadow-2xl p-8 flex flex-col items-center text-center animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className={`p-4 rounded-full ${iconBg} mb-4`}>
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

        {/* Message */}
        {message && (
          <p className="text-sm text-slate-400 leading-relaxed mb-8">{message}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-2xl transition-all cursor-pointer text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 font-bold rounded-2xl transition-all cursor-pointer text-sm disabled:opacity-50 ${confirmBtn}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
