import React, { useState } from 'react';
import {
  X,
  Calendar,
  Trash2,
  Edit2,
  Check,
  TrendingUp,
  Plus,
  Flame,
  Clock,
  Info
} from 'lucide-react';
import { Tracker, TrackerEntry } from '../types';
import { useApp } from '../context/AppContext';
import { getTodayDateString, formatDate, formatDuration } from '../utils/date';
import { getIconComponent } from '../utils/icons';

interface TrackerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: Tracker | null;
}

export const TrackerHistoryModal: React.FC<TrackerHistoryModalProps> = ({
  isOpen,
  onClose,
  tracker,
}) => {
  const {
    getTrackerEntries,
    getTrackerStreak,
    getTrackerWeeklyStats,
    logTrackerEntry,
    deleteTrackerEntry,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [inputValue, setInputValue] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  if (!isOpen || !tracker) return null;

  const entries = getTrackerEntries(tracker.id);
  const streak = getTrackerStreak(tracker.id);
  const weeklyStats = getTrackerWeeklyStats(tracker.id);
  const TrackerIcon = getIconComponent(tracker.icon);

  // Compute actual summary without faking
  const totalEntriesCount = entries.length;
  const values = entries.map(e => e.value);
  const totalSum = values.reduce((a, b) => a + b, 0);
  const averageValue = totalEntriesCount > 0 ? (totalSum / totalEntriesCount).toFixed(1) : '0';

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    let finalValue = inputValue;

    if (tracker.type === 'duration') {
      finalValue = Math.max(0, Number(durationHours) * 60 + Number(durationMins));
    } else if (tracker.type === 'boolean') {
      finalValue = inputValue ? 1 : 0;
    }

    logTrackerEntry(tracker.id, selectedDate, finalValue, notes.trim() || undefined);
    setNotes('');
    setEditingEntryId(null);
  };

  const handleStartEdit = (entry: TrackerEntry) => {
    setEditingEntryId(entry.id);
    setSelectedDate(entry.date);
    setNotes(entry.notes || '');
    if (tracker.type === 'duration') {
      setDurationHours(Math.floor(entry.value / 60));
      setDurationMins(entry.value % 60);
    } else {
      setInputValue(entry.value);
    }
  };

  const formatDisplayValue = (val: number) => {
    if (tracker.type === 'boolean') {
      return val >= 1 ? 'Completed' : 'Missed';
    }
    if (tracker.type === 'duration') {
      return formatDuration(val);
    }
    if (tracker.type === 'percentage') {
      return `${val}%`;
    }
    if (tracker.type === 'amount') {
      return `${tracker.unit || '$'}${val}`;
    }
    return `${val} ${tracker.unit || ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: tracker.color }}
            >
              <TrackerIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                {tracker.name} History
              </h3>
              <p className="text-xs text-slate-500">
                Type: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{tracker.type}</span>
                {tracker.target ? ` • Target: ${tracker.target} ${tracker.unit || ''}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Quick Metrics Bar (Only real data) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Current Streak
              </span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                <span className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Logs
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-display mt-1 block">
                {totalEntriesCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                {tracker.type === 'duration' ? 'Total Time' : 'Avg / Log'}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-display mt-1 block truncate">
                {totalEntriesCount === 0
                  ? 'No data'
                  : tracker.type === 'duration'
                  ? formatDuration(totalSum)
                  : tracker.type === 'boolean'
                  ? `${Math.round((totalSum / totalEntriesCount) * 100)}%`
                  : `${averageValue} ${tracker.unit || ''}`}
              </span>
            </div>
          </div>

          {/* Past 7 Days Visual Breakdown */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block font-display">
              Last 7 Days Activity
            </span>
            <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-slate-50/70 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60">
              {weeklyStats.map(stat => {
                const dayLabel = new Date(stat.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
                return (
                  <div key={stat.date} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="text-[10px] font-medium text-slate-400">{dayLabel}</span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        stat.value > 0
                          ? stat.metTarget
                            ? 'text-white shadow-2xs'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400'
                      }`}
                      style={{ backgroundColor: stat.metTarget ? tracker.color : undefined }}
                      title={`${formatDate(stat.date)}: ${formatDisplayValue(stat.value)}`}
                    >
                      {stat.value > 0 ? (tracker.type === 'boolean' ? '✓' : stat.value) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add / Edit Entry Form */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181E] shadow-xs">
            <span className="text-xs font-bold text-slate-900 dark:text-white block mb-3 font-display">
              {editingEntryId ? 'Update Entry' : 'Log / Edit Entry for Date'}
            </span>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Value ({tracker.type})
                  </label>
                  {tracker.type === 'boolean' ? (
                    <button
                      type="button"
                      onClick={() => setInputValue(inputValue ? 0 : 1)}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                        inputValue
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {inputValue ? 'Completed (Yes)' : 'Not Completed (No)'}
                    </button>
                  ) : tracker.type === 'duration' ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 flex items-center bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          value={durationHours}
                          onChange={e => setDurationHours(Math.max(0, Number(e.target.value)))}
                          className="w-full text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">h</span>
                      </div>
                      <div className="flex-1 flex items-center bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={durationMins}
                          onChange={e => setDurationMins(Math.max(0, Math.min(59, Number(e.target.value))))}
                          className="w-full text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">m</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={inputValue}
                      onChange={e => setInputValue(Number(e.target.value))}
                      step={tracker.type === 'amount' || tracker.type === 'number' ? '0.5' : '1'}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional note for this entry..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                {editingEntryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntryId(null);
                      setNotes('');
                      setInputValue(0);
                    }}
                    className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
                >
                  {editingEntryId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* Historical Entries Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-display">
                Recorded Entries ({entries.length})
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-slate-50/50 dark:bg-[#12141A]/50 border border-slate-200/60 dark:border-slate-800/60">
                <Info className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No data yet.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Log your first entry above to start tracking real progress.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white min-w-[80px]">
                        {formatDate(entry.date)}
                      </div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formatDisplayValue(entry.value)}
                      </div>
                      {entry.notes && (
                        <div className="text-slate-400 text-[11px] truncate max-w-[140px]">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTrackerEntry(entry.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
