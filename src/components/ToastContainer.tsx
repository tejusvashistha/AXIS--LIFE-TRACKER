import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-slide-up ${
            t.type === 'success'
              ? 'bg-white dark:bg-[#1A1D24] border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
              : t.type === 'error'
              ? 'bg-white dark:bg-[#1A1D24] border-rose-500/30 text-rose-900 dark:text-rose-300'
              : 'bg-white dark:bg-[#1A1D24] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-indigo-500 shrink-0" />}
            <p className="text-xs font-medium truncate">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
