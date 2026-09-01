import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ToggleLeft,
  Hash,
  PlusCircle,
  Clock,
  Percent,
  Coins,
  Sparkles
} from 'lucide-react';
import { Tracker, TrackerType, TrackerFrequency } from '../types';
import { useApp } from '../context/AppContext';
import { AVAILABLE_ICONS, COLOR_PALETTES, getIconComponent } from '../utils/icons';
import { getTodayDateString } from '../utils/date';

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackerData: Omit<Tracker, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  editingTracker?: Tracker | null;
  defaultHubId?: string | null;
}

const TRACKER_TYPES: {
  type: TrackerType;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultUnit: string;
  defaultTarget: number;
}[] = [
  {
    type: 'boolean',
    label: 'Yes / No',
    description: 'Track if an activity occurred (e.g. Workout completed, Took vitamins)',
    icon: ToggleLeft,
    defaultUnit: 'done',
    defaultTarget: 1,
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Track a numerical value (e.g. Study hours = 4, Weight = 72kg)',
    icon: Hash,
    defaultUnit: 'hrs',
    defaultTarget: 3,
  },
  {
    type: 'counter',
    label: 'Counter (+/-)',
    description: 'Quick increment counters (e.g. Water = 8 glasses, Pomodoro = 5)',
    icon: PlusCircle,
    defaultUnit: 'glasses',
    defaultTarget: 8,
  },
  {
    type: 'duration',
    label: 'Duration',
    description: 'Track time spent in minutes or hours (e.g. Coding = 2h 30m, Reading = 45m)',
    icon: Clock,
    defaultUnit: 'min',
    defaultTarget: 60,
  },
  {
    type: 'percentage',
    label: 'Percentage',
    description: 'Track progress 0% to 100% (e.g. Course completion = 75%)',
    icon: Percent,
    defaultUnit: '%',
    defaultTarget: 100,
  },
  {
    type: 'amount',
    label: 'Amount / Currency',
    description: 'Track financial totals (e.g. Money saved = ₹500 / $500, Daily spend)',
    icon: Coins,
    defaultUnit: '$',
    defaultTarget: 50,
  },
];

export const TrackerModal: React.FC<TrackerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTracker,
  defaultHubId,
}) => {
  const { data } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('activity');
  const [type, setType] = useState<TrackerType>('counter');
  const [unit, setUnit] = useState('glasses');
  const [target, setTarget] = useState<number>(8);
  const [frequency, setFrequency] = useState<TrackerFrequency>('daily');
  const [hubId, setHubId] = useState<string | null>(defaultHubId || null);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [error, setError] = useState('');
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    if (editingTracker) {
      setName(editingTracker.name);
      setDescription(editingTracker.description || '');
      setIcon(editingTracker.icon || 'activity');
      setType(editingTracker.type);
      setUnit(editingTracker.unit || '');
      setTarget(editingTracker.target ?? 1);
      setFrequency(editingTracker.frequency);
      setHubId(editingTracker.hubId);
      setStartDate(editingTracker.startDate || getTodayDateString());
      setEndDate(editingTracker.endDate || '');
      setColor(editingTracker.color || '#6366F1');
    } else {
      setName('');
      setDescription('');
      setIcon('activity');
      setType('counter');
      setUnit('glasses');
      setTarget(8);
      setFrequency('daily');
      setHubId(defaultHubId || null);
      setStartDate(getTodayDateString());
      setEndDate('');
      setColor('#6366F1');
    }
    setError('');
  }, [editingTracker, isOpen, defaultHubId]);

  if (!isOpen) return null;

  const handleTypeSelect = (selectedType: TrackerType) => {
    setType(selectedType);
    const def = TRACKER_TYPES.find(t => t.type === selectedType);
    if (def) {
      setUnit(def.defaultUnit);
      setTarget(def.defaultTarget);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tracker name is required');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      type,
      unit: unit.trim(),
      target: Number(target) || undefined,
      frequency,
      hubId: hubId || null,
      startDate: startDate || getTodayDateString(),
      endDate: endDate || undefined,
      color,
    });
    onClose();
  };

  const filteredIcons = Object.entries(AVAILABLE_ICONS).filter(([key, item]) =>
    key.toLowerCase().includes(iconSearch.toLowerCase()) ||
    item.label.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const PreviewIcon = getIconComponent(icon);
  const activeHubs = data.hubs.filter(h => !h.isArchived);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {editingTracker ? 'Edit Tracker' : 'Create Custom Tracker'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Build a custom tracker for anything you want to measure
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Tracker Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tracker Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRACKER_TYPES.map(t => {
                const IconComponent = t.icon;
                const isSelected = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => handleTypeSelect(t.type)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#12141A]/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold font-display block">{t.label}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{t.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Hub Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tracker Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Water, Deep Study, Workout..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                autoFocus
              />
              {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Hub
              </label>
              <select
                value={hubId || ''}
                onChange={e => setHubId(e.target.value || null)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="">Global (No Hub)</option>
                {activeHubs.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target, Unit & Frequency (if applicable) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {type !== 'boolean' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {type === 'duration' ? 'Target (Minutes)' : 'Target Value'}
                  </label>
                  <input
                    type="number"
                    value={target}
                    onChange={e => setTarget(Number(e.target.value))}
                    min="0"
                    step={type === 'amount' || type === 'number' ? '0.5' : '1'}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                    placeholder="e.g. glasses, hrs, $, pages"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as TrackerFrequency)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Maintain consistency in morning routine..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color
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

          {/* Icon Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Icon
              </label>
              <input
                type="text"
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                placeholder="Search..."
                className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none w-28"
              />
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60">
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
              {editingTracker ? 'Save Changes' : 'Create Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
