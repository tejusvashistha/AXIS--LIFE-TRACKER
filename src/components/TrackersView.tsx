import React, { useState, useMemo } from 'react';
import {
  Plus,
  Activity,
  Flame,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  History,
  TrendingUp,
  Check
} from 'lucide-react';
import { Tracker } from '../types';
import { useApp } from '../context/AppContext';
import { getTodayDateString, formatDate, formatDuration } from '../utils/date';
import { getIconComponent } from '../utils/icons';
import { ConfirmDialog } from './ConfirmDialog';

interface TrackersViewProps {
  onOpenCreateTracker: () => void;
  onEditTracker: (tracker: Tracker) => void;
  onOpenHistory: (trackerId: string) => void;
}

export const TrackersView: React.FC<TrackersViewProps> = ({
  onOpenCreateTracker,
  onEditTracker,
  onOpenHistory,
}) => {
  const {
    data,
    logTrackerEntry,
    getTrackerTodayEntry,
    getTrackerStreak,
    deleteTracker,
  } = useApp();

  const [selectedHubId, setSelectedHubId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [trackerToDelete, setTrackerToDelete] = useState<Tracker | null>(null);

  const today = getTodayDateString();
  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const hubMap = useMemo(() => new Map(data.hubs.map(h => [h.id, h])), [data.hubs]);

  const filteredTrackers = useMemo(() => {
    return data.trackers.filter(trk => {
      if (trk.isArchived) return false;
      if (selectedHubId !== 'all' && trk.hubId !== selectedHubId) return false;
      if (selectedType !== 'all' && trk.type !== selectedType) return false;
      return true;
    });
  }, [data.trackers, selectedHubId, selectedType]);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Custom Trackers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Design your own habit loops, numerical metrics, and duration logs
          </p>
        </div>

        <button
          onClick={onOpenCreateTracker}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Tracker</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#16181E] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter by:</span>
          <select
            value={selectedHubId}
            onChange={e => setSelectedHubId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Hubs</option>
            {activeHubs.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Tracker Types</option>
            <option value="boolean">Yes / No (Habit)</option>
            <option value="counter">Counter (+/-)</option>
            <option value="duration">Duration (Time)</option>
            <option value="number">Number</option>
            <option value="amount">Amount ($)</option>
            <option value="percentage">Percentage (%)</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredTrackers.length} {filteredTrackers.length === 1 ? 'tracker' : 'trackers'}
        </span>
      </div>

      {/* Trackers Grid */}
      {filteredTrackers.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#16181E] border border-dashed border-slate-200 dark:border-slate-800 shadow-xs">
          <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            No trackers created
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Build your first custom tracker for daily habits, deep work hours, hydration, or finance.
          </p>
          <button
            onClick={onOpenCreateTracker}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tracker</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrackers.map(trk => {
            const todayEntry = getTrackerTodayEntry(trk.id);
            const currentVal = todayEntry?.value ?? 0;
            const streak = getTrackerStreak(trk.id);
            const TrkIcon = getIconComponent(trk.icon);
            const hub = trk.hubId ? hubMap.get(trk.hubId) : null;
            const metTarget = trk.target ? currentVal >= trk.target : currentVal > 0;

            return (
              <div
                key={trk.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#16181E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: trk.color }}
                      >
                        <TrkIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                          {trk.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            {trk.type}
                          </span>
                          {hub && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.2 rounded text-white"
                              style={{ backgroundColor: hub.color }}
                            >
                              {hub.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Streak badge */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{streak}d</span>
                    </div>
                  </div>

                  {trk.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {trk.description}
                    </p>
                  )}

                  {/* Target info */}
                  {trk.target && (
                    <div className="mb-3 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Target: {trk.target} {trk.unit || ''}</span>
                      <span className={metTarget ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                        {metTarget ? 'Target Met ✓' : `${currentVal} / ${trk.target}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Today Interactive Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Today's Log
                    </span>

                    {/* Type specific quick buttons */}
                    {trk.type === 'boolean' ? (
                      <button
                        onClick={() => logTrackerEntry(trk.id, today, currentVal ? 0 : 1)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentVal >= 1
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {currentVal >= 1 ? '✓ Completed' : 'Mark Done'}
                      </button>
                    ) : trk.type === 'counter' ? (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        <button
                          onClick={() => logTrackerEntry(trk.id, today, Math.max(0, currentVal - 1))}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#12141A] font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-2 text-slate-900 dark:text-white">
                          {currentVal}
                        </span>
                        <button
                          onClick={() => logTrackerEntry(trk.id, today, currentVal + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#12141A] font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenHistory(trk.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {currentVal > 0
                          ? trk.type === 'duration'
                            ? formatDuration(currentVal)
                            : `${currentVal} ${trk.unit || ''}`
                          : 'Log Value'}
                      </button>
                    )}
                  </div>

                  {/* Actions: History, Edit, Delete */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                    <button
                      onClick={() => onOpenHistory(trk.id)}
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History & Stats</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTracker(trk)}
                        className="p-1 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Tracker"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTrackerToDelete(trk)}
                        className="p-1 rounded-lg hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Tracker"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!trackerToDelete}
        title={`Delete "${trackerToDelete?.name}"?`}
        message="Are you sure you want to permanently delete this tracker and all its historical log entries?"
        confirmLabel="Delete Tracker"
        isDestructive={true}
        onConfirm={() => {
          if (trackerToDelete) {
            deleteTracker(trackerToDelete.id);
            setTrackerToDelete(null);
          }
        }}
        onCancel={() => setTrackerToDelete(null)}
      />
    </div>
  );
};
