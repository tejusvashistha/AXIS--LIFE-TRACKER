import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { Goal, GoalStatus } from '../types';
import { useApp } from '../context/AppContext';
import { COLOR_PALETTES } from '../utils/icons';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingGoal?: Goal | null;
  defaultHubId?: string | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
  defaultHubId,
}) => {
  const { data } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('%');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<GoalStatus>('in_progress');
  const [hubId, setHubId] = useState<string | null>(defaultHubId || null);
  const [color, setColor] = useState('#6366F1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setTargetValue(editingGoal.targetValue);
      setCurrentValue(editingGoal.currentValue);
      setUnit(editingGoal.unit || '%');
      setDeadline(editingGoal.deadline || '');
      setStatus(editingGoal.status);
      setHubId(editingGoal.hubId);
      setColor(editingGoal.color || '#6366F1');
    } else {
      setTitle('');
      setDescription('');
      setTargetValue(100);
      setCurrentValue(0);
      setUnit('%');
      setDeadline('');
      setStatus('in_progress');
      setHubId(defaultHubId || null);
      setColor('#6366F1');
    }
    setError('');
  }, [editingGoal, isOpen, defaultHubId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      targetValue: Number(targetValue) || 100,
      currentValue: Number(currentValue) || 0,
      unit: unit.trim() || '%',
      deadline: deadline || undefined,
      status,
      hubId: hubId || null,
      color,
    });
    onClose();
  };

  const activeHubs = data.hubs.filter(h => !h.isArchived);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {editingGoal ? 'Edit Goal' : 'Create Custom Goal'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set milestones and track real progress toward your targets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Read 12 Books, Complete Course, Save $5,000..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              autoFocus
            />
            {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Why this goal matters and what success looks like..."
              rows={2}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Metrics: Target, Current, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Progress
              </label>
              <input
                type="number"
                value={currentValue}
                onChange={e => setCurrentValue(Number(e.target.value))}
                min="0"
                step="any"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Value
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={e => setTargetValue(Number(e.target.value))}
                min="1"
                step="any"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit / Label
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. %, books, km, $"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Hub, Deadline, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Hub
              </label>
              <select
                value={hubId || ''}
                onChange={e => setHubId(e.target.value || null)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Global / No Hub</option>
                {activeHubs.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTES.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                >
                  {color === p.hex && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-xs"
            >
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
