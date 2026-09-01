import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Activity,
  Flame,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getTodayDateString,
  formatDate,
  addDays,
  getPastNDays,
  formatDuration
} from '../utils/date';
import { getIconComponent } from '../utils/icons';

interface DailyCalendarViewProps {
  onOpenCreateTask: (hubId?: string) => void;
  onOpenCreateTracker: (hubId?: string) => void;
  onOpenTrackerHistory: (trackerId: string) => void;
}

export const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
  onOpenCreateTask,
  onOpenCreateTracker,
  onOpenTrackerHistory,
}) => {
  const {
    data,
    toggleTaskComplete,
    logTrackerEntry,
    getTrackerTodayEntry,
    getTrackerStreak,
    navigateTo,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const today = getTodayDateString();

  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const hubMap = useMemo(() => new Map(data.hubs.map(h => [h.id, h])), [data.hubs]);

  // Generate 7-day mini strip around selected date
  const miniWeekStrip = useMemo(() => {
    const days: { date: string; label: string; dayNum: number; isToday: boolean; isSelected: boolean }[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = addDays(selectedDate, i);
      const dateObj = new Date(d + 'T00:00:00');
      days.push({
        date: d,
        label: dateObj.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: dateObj.getDate(),
        isToday: d === today,
        isSelected: d === selectedDate,
      });
    }
    return days;
  }, [selectedDate, today]);

  // Tasks for the selected date
  const tasksForDate = data.tasks.filter(t => t.dueDate === selectedDate);
  const pendingTasks = tasksForDate.filter(t => t.status !== 'completed');
  const completedTasks = tasksForDate.filter(t => t.status === 'completed');

  // Trackers active
  const activeTrackers = data.trackers.filter(t => !t.isArchived);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header with Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Daily Execution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Focused daily planner for action items and tracker logs
          </p>
        </div>

        {/* Date Selector & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
            />
          </div>

          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Jump to Today
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Quick Strip */}
      <div className="grid grid-cols-7 gap-2 p-2 bg-white dark:bg-[#16181E] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {miniWeekStrip.map(day => (
          <button
            key={day.date}
            onClick={() => setSelectedDate(day.date)}
            className={`flex flex-col items-center py-2.5 rounded-xl transition-all ${
              day.isSelected
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="text-[10px] uppercase">{day.label}</span>
            <span className="text-sm font-display mt-0.5">{day.dayNum}</span>
            {day.isToday && !day.isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
            )}
          </button>
        ))}
      </div>

      {/* Daily Main Grid: Tasks + Trackers for Selected Date */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Tasks for Selected Date */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#16181E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Tasks for {formatDate(selectedDate)}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {tasksForDate.length === 0
                    ? 'No tasks scheduled'
                    : `${pendingTasks.length} pending, ${completedTasks.length} completed`}
                </p>
              </div>

              <button
                onClick={() => onOpenCreateTask()}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {tasksForDate.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No tasks due on this date.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click + Add Task to schedule one.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasksForDate.map(task => {
                  const isDone = task.status === 'completed';
                  const hub = task.hubId ? hubMap.get(task.hubId) : null;

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                        isDone
                          ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60'
                          : 'bg-white dark:bg-[#1A1D24] border-slate-200 dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </button>
                        <div className="min-w-0">
                          <span
                            className={`font-semibold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 truncate">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {hub && (
                        <span
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0 ml-2"
                          style={{ backgroundColor: hub.color }}
                        >
                          {hub.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trackers for Selected Date */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#16181E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Trackers for {formatDate(selectedDate)}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Log entries directly for this selected date
                </p>
              </div>

              <button
                onClick={() => onOpenCreateTracker()}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Tracker</span>
              </button>
            </div>

            {activeTrackers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No trackers defined yet.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Create custom habits and metrics to track daily.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTrackers.map(trk => {
                  const entry = data.trackerEntries.find(
                    e => e.trackerId === trk.id && e.date === selectedDate
                  );
                  const currentVal = entry?.value ?? 0;
                  const TrkIcon = getIconComponent(trk.icon);

                  return (
                    <div
                      key={trk.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200/60 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                          style={{ backgroundColor: trk.color }}
                        >
                          <TrkIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {trk.name}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {trk.type}
                          </span>
                        </div>
                      </div>

                      {/* Interactive control for this date */}
                      <div className="flex items-center gap-2 shrink-0">
                        {trk.type === 'boolean' ? (
                          <button
                            onClick={() => logTrackerEntry(trk.id, selectedDate, currentVal ? 0 : 1)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              currentVal >= 1
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                            }`}
                          >
                            {currentVal >= 1 ? '✓ Done' : 'Mark Done'}
                          </button>
                        ) : trk.type === 'counter' ? (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-[#12141A] border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                            <button
                              onClick={() => logTrackerEntry(trk.id, selectedDate, Math.max(0, currentVal - 1))}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold px-1 text-slate-900 dark:text-white">
                              {currentVal}
                            </span>
                            <button
                              onClick={() => logTrackerEntry(trk.id, selectedDate, currentVal + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenTrackerHistory(trk.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                          >
                            {currentVal > 0 ? (trk.type === 'duration' ? formatDuration(currentVal) : `${currentVal} ${trk.unit || ''}`) : 'Log Value'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
