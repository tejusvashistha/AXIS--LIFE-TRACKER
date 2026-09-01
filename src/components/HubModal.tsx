import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Folder } from 'lucide-react';
import { Hub } from '../types';
import { AVAILABLE_ICONS, COLOR_PALETTES, getIconComponent } from '../utils/icons';

interface HubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hubData: { name: string; description?: string; icon: string; color: string; coverImage?: string }) => void;
  editingHub?: Hub | null;
}

export const HubModal: React.FC<HubModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHub,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('#6366F1');
  const [iconSearch, setIconSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHub) {
      setName(editingHub.name);
      setDescription(editingHub.description || '');
      setIcon(editingHub.icon || 'folder');
      setColor(editingHub.color || '#6366F1');
    } else {
      setName('');
      setDescription('');
      setIcon('folder');
      setColor('#6366F1');
    }
    setError('');
    setIconSearch('');
  }, [editingHub, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Hub name is required');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
    });
    onClose();
  };

  const filteredIcons = Object.entries(AVAILABLE_ICONS).filter(([key, item]) =>
    key.toLowerCase().includes(iconSearch.toLowerCase()) ||
    item.label.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const PreviewIcon = getIconComponent(icon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {editingHub ? 'Edit Hub' : 'Create Custom Hub'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize an area of your life (e.g. Study, Fitness, Business, Coding)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Live Preview Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#12141A]/50 flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: color }}
            >
              <PreviewIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display truncate">
                {name || 'Hub Name Preview'}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {description || 'Workspace area description'}
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hub Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Fitness, Study, Projects, Finance..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              autoFocus
            />
            {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What this life area focuses on..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTES.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                >
                  {color === p.hex && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hub Icon
              </label>
              <input
                type="text"
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                placeholder="Search icon..."
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
              />
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60">
              {filteredIcons.map(([iconKey, { icon: IconComp, label }]) => {
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    title={label}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs scale-105'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
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
              {editingHub ? 'Save Changes' : 'Create Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
