import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Calendar,
  Activity,
  Target,
  FileText,
  ArrowRight,
  Sliders,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  MoveLeft,
  MoveRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, getGreeting, formatDate, formatDuration } from '../utils/date';
import { getIconComponent } from '../utils/icons';
import { Hub } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface DashboardViewProps {
  onOpenCreateHub: () => void;
  onEditHub: (hub: Hub) => void;
  onOpenCreateTask: () => void;
  onOpenCreateTracker: () => void;
  onOpenCreateGoal: () => void;
  onOpenCreateNote: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateHub,
  onEditHub,
  onOpenCreateTask,
  onOpenCreateTracker,
  onOpenCreateGoal,
  onOpenCreateNote,
}) => {
  const {
    data,
    navigateTo,
    setIsCustomizeDashboardOpen,
    toggleTaskComplete,
    logTrackerEntry,
    deleteHub,
    reorderHubs,
    showToast,
  } = useApp();

  const [activeMenuHubId, setActiveMenuHubId] = useState<string | null>(null);
  const [hubToDelete, setHubToDelete] = useState<Hub | null>(null);

  const today = getTodayDateString();
  const greeting = getGreeting();
  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const { dashboard } = data.settings;

  // Real user data for today
  const tasksDueToday = data.tasks.filter(t => t.dueDate === today);
  const pendingTasks = tasksDueToday.filter(t => t.status !== 'completed');
  const activeGoals = data.goals.filter(g => g.status === 'in_progress');
  const recentNotes = data.notes.slice(0, 3);
  const activeTrackers = data.trackers.filter(t => !t.isArchived);

  // Map hubs for quick lookup
  const hubMap = new Map(data.hubs.map(h => [h.id, h]));

  // Stats for editorial footer (Strictly real user data)
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const handleMoveHubPosition = (hubId: string, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const index = activeHubs.findIndex(h => h.id === hubId);
    if (index === -1) return;
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeHubs.length) return;

    const reordered = [...activeHubs];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    reorderHubs(reordered.map(h => h.id));
    showToast('Hub order updated', 'success');
  };

  const handleConfirmDeleteHub = () => {
    if (!hubToDelete) return;
    const res = deleteHub(hubToDelete.id, true);
    setHubToDelete(null);
    setActiveMenuHubId(null);
    showToast(`Hub "${res.deletedHub.name}" removed`, 'info');
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* 1. Editorial Contextual Greeting Section */}
      {dashboard.showGreeting && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E5E1] dark:border-[#282A32]">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light italic font-serif text-[#1A1A1A] dark:text-white mb-2 tracking-tight">
              {greeting}.
            </h1>
            <p className="text-base sm:text-lg text-[#666660] dark:text-[#A1A19D] tracking-tight">
              Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCustomizeDashboardOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#181A1F] dark:hover:bg-[#22242B] border border-[#E5E5E1] dark:border-[#282A32] rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              aria-label="Customize Dashboard and Hubs"
            >
              <Sliders className="w-3.5 h-3.5 opacity-70" />
              <span>Customize</span>
            </button>
            <button
              onClick={onOpenCreateHub}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-slate-200 rounded-full transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              aria-label="Create New Hub"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Hub</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. My Workspace / Hubs System */}
      {dashboard.showHubs && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                My Workspace
              </h2>
              {activeHubs.length > 0 && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0F0EE] dark:bg-[#181A1F] text-[#666660] dark:text-[#A1A19D] border border-[#E5E5E1] dark:border-[#282A32]">
                  {activeHubs.length} {activeHubs.length === 1 ? 'Hub' : 'Hubs'}
                </span>
              )}
            </div>

            {activeHubs.length > 0 && (
              <button
                onClick={onOpenCreateHub}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 px-3.5 py-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors uppercase tracking-wider text-[10px] focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              >
                + Add Hub
              </button>
            )}
          </div>

          {/* Minimal, concise empty state strictly adhering to prompt */}
          {activeHubs.length === 0 ? (
            <div className="border-2 border-dashed border-[#E5E5E1] dark:border-[#282A32] rounded-3xl flex flex-col items-center justify-center p-10 sm:p-14 text-center">
              <div className="w-14 h-14 bg-[#F0F0EE] dark:bg-[#181A1F] rounded-full flex items-center justify-center mb-4 text-2xl text-[#1A1A1A] dark:text-white shadow-2xs font-light">
                +
              </div>
              <h3 className="text-2xl font-light text-[#1A1A1A] dark:text-white mb-2 font-serif">
                Your workspace is empty.
              </h3>
              <p className="text-[#666660] dark:text-[#A1A19D] max-w-sm mb-6 text-sm leading-relaxed">
                Create your first hub and build your system around what matters to you.
              </p>
              <button
                onClick={onOpenCreateHub}
                className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#1A1A1A] font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg flex items-center gap-2.5 transition-all focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              >
                <span className="text-base leading-none">+</span>
                <span>Create Your First Hub</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeHubs.map((hub, index) => {
                const HubIcon = getIconComponent(hub.icon);
                const hubTasks = data.tasks.filter(t => t.hubId === hub.id);
                const hubPendingTasks = hubTasks.filter(t => t.status !== 'completed').length;
                const hubCompletedTasks = hubTasks.filter(t => t.status === 'completed').length;
                const hubTrackers = data.trackers.filter(t => t.hubId === hub.id && !t.isArchived).length;
                const hubGoals = data.goals.filter(g => g.hubId === hub.id && g.status === 'in_progress').length;

                // Real progress calculation if tasks exist
                const taskProgressPercent = hubTasks.length > 0
                  ? Math.round((hubCompletedTasks / hubTasks.length) * 100)
                  : null;

                const isMenuOpen = activeMenuHubId === hub.id;

                return (
                  <div
                    key={hub.id}
                    onClick={() => navigateTo('hub-detail', hub.id)}
                    className="group relative p-5 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] hover:border-[#1A1A1A] dark:hover:border-white/50 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Icon + Actions Menu */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs transition-transform group-hover:scale-105"
                          style={{ backgroundColor: hub.color }}
                        >
                          <HubIcon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {/* Reorder Buttons */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={e => handleMoveHubPosition(hub.id, 'left', e)}
                            className="p-1 rounded-md text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Move Hub Left"
                            aria-label={`Move ${hub.name} Left`}
                          >
                            <MoveLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === activeHubs.length - 1}
                            onClick={e => handleMoveHubPosition(hub.id, 'right', e)}
                            className="p-1 rounded-md text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Move Hub Right"
                            aria-label={`Move ${hub.name} Right`}
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Actions Dropdown Trigger */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuHubId(isMenuOpen ? null : hub.id)}
                              className="p-1 rounded-md text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] transition-colors"
                              title="Hub Options"
                              aria-label="Hub Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1C1E25] border border-[#E5E5E1] dark:border-[#282A32] rounded-xl p-1 shadow-lg z-20 animate-slide-up text-left">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setActiveMenuHubId(null);
                                    navigateTo('hub-detail', hub.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] rounded-lg transition-colors"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                  <span>Open Hub</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setActiveMenuHubId(null);
                                    onEditHub(hub);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5 opacity-60" />
                                  <span>Edit Hub</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setActiveMenuHubId(null);
                                    setHubToDelete(hub);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Hub</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white group-hover:underline decoration-1 underline-offset-2 transition-all">
                        {hub.name}
                      </h3>
                      {hub.description ? (
                        <p className="text-xs text-[#666660] dark:text-[#A1A19D] mt-1 line-clamp-2 leading-relaxed">
                          {hub.description}
                        </p>
                      ) : (
                        <p className="text-xs text-[#666660]/70 dark:text-[#A1A19D]/70 font-serif italic mt-1">
                          Dedicated life area
                        </p>
                      )}
                    </div>

                    {/* Progress Bar (Only shown if real tasks exist in this hub) */}
                    {taskProgressPercent !== null && (
                      <div className="mt-4 mb-1">
                        <div className="flex items-center justify-between text-[10px] text-[#666660] dark:text-[#A1A19D] mb-1">
                          <span>Task Progress</span>
                          <span className="font-bold text-[#1A1A1A] dark:text-white">{taskProgressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F0F0EE] dark:bg-[#282A32] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${taskProgressPercent}%`,
                              backgroundColor: hub.color || '#1A1A1A',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Real Data Counter Footer */}
                    <div className="pt-3.5 mt-3 border-t border-[#E5E5E1] dark:border-[#282A32] flex items-center justify-between text-[11px] font-medium text-[#666660] dark:text-[#A1A19D]">
                      <span>
                        {hubPendingTasks} active task{hubPendingTasks === 1 ? '' : 's'}
                      </span>
                      <span>
                        {hubTrackers} tracker{hubTrackers === 1 ? '' : 's'}
                      </span>
                      {hubGoals > 0 && (
                        <span>
                          {hubGoals} goal{hubGoals === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Hub Card */}
              <button
                onClick={onOpenCreateHub}
                className="p-5 rounded-2xl border border-dashed border-[#E5E5E1] dark:border-[#282A32] hover:border-[#1A1A1A] dark:hover:border-white bg-[#F9F9F7]/50 dark:bg-[#121418]/50 hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-all flex flex-col items-center justify-center text-center group min-h-[160px] focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#E5E5E1] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white group-hover:bg-[#1A1A1A] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#1A1A1A] flex items-center justify-center mb-2 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                  Create Hub
                </span>
                <span className="text-[11px] text-[#666660] dark:text-[#A1A19D] font-serif italic mt-0.5">
                  Add another area of life
                </span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3. Daily Focus & Trackers Section */}
      {dashboard.showDailyFocus && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                    Today's Tasks
                  </h3>
                  {pendingTasks.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                      {pendingTasks.length} pending
                    </span>
                  )}
                </div>
                <button
                  onClick={onOpenCreateTask}
                  className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {tasksDueToday.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#666660] dark:text-[#A1A19D]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-[#1A1A1A] dark:text-white">
                    No tasks for today.
                  </p>
                  <p className="text-[11px] font-serif italic mt-0.5">
                    Enjoy the empty space or capture a new task.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasksDueToday.map(task => {
                    const isDone = task.status === 'completed';
                    const hub = task.hubId ? hubMap.get(task.hubId) : null;
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                          isDone
                            ? 'bg-[#F9F9F7] dark:bg-[#121418] border-[#E5E5E1]/60 dark:border-[#282A32] text-[#666660]'
                            : 'bg-white dark:bg-[#1C1E25] border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                              isDone
                                ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white dark:bg-white dark:border-white dark:text-[#1A1A1A]'
                                : 'border-[#CCCCCC] dark:border-[#444] hover:border-[#1A1A1A]'
                            }`}
                            aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                          >
                            {isDone && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                          <span className={`truncate font-medium ${isDone ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </span>
                        </div>

                        {hub && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white shrink-0 ml-2"
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

            <div className="pt-4 mt-4 border-t border-[#E5E5E1] dark:border-[#282A32] flex justify-end">
              <button
                onClick={() => navigateTo('tasks')}
                className="text-xs font-bold uppercase tracking-wider text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Trackers Logging for Today */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                  Today's Trackers
                </h3>
                <button
                  onClick={onOpenCreateTracker}
                  className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tracker</span>
                </button>
              </div>

              {activeTrackers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#666660] dark:text-[#A1A19D]">
                  <Activity className="w-6 h-6 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-[#1A1A1A] dark:text-white">
                    No trackers configured.
                  </p>
                  <p className="text-[11px] font-serif italic mt-0.5">
                    Track habits, hydration, pages read, or workouts daily.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTrackers.slice(0, 4).map(trk => {
                    const TrkIcon = getIconComponent(trk.icon);
                    const todayEntry = data.trackerEntries.find(e => e.trackerId === trk.id && e.date === today);
                    const currentVal = todayEntry ? todayEntry.value : 0;

                    return (
                      <div
                        key={trk.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center text-white shrink-0 text-xs"
                            style={{ backgroundColor: trk.color }}
                          >
                            <TrkIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#1A1A1A] dark:text-white block truncate">
                              {trk.name}
                            </span>
                            <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] font-serif italic block">
                              {currentVal > 0 ? `Logged today (${currentVal} ${trk.unit || ''})` : 'Pending today'}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Controls per Tracker Type */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {trk.type === 'boolean' ? (
                            <button
                              onClick={() => {
                                logTrackerEntry(trk.id, today, currentVal ? 0 : 1);
                                showToast(currentVal ? 'Tracker reset' : 'Habit logged', 'success');
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                currentVal >= 1
                                  ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-2xs'
                                  : 'bg-[#E5E5E1] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white hover:bg-[#D5D5D1]'
                              }`}
                            >
                              {currentVal >= 1 ? '✓ Done' : 'Mark'}
                            </button>
                          ) : trk.type === 'counter' ? (
                            <div className="flex items-center gap-1.5 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-full px-1.5 py-0.5">
                              <button
                                onClick={() => logTrackerEntry(trk.id, today, Math.max(0, currentVal - 1))}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#666660] hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] text-xs font-bold"
                                aria-label="Decrease tracker count"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold px-1.5 min-w-[20px] text-center text-[#1A1A1A] dark:text-white font-mono">
                                {currentVal}
                              </span>
                              <button
                                onClick={() => logTrackerEntry(trk.id, today, currentVal + 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#666660] hover:bg-[#F0F0EE] dark:hover:bg-[#282A32] text-xs font-bold"
                                aria-label="Increase tracker count"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => navigateTo('daily')}
                              className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[#E5E5E1] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white hover:bg-[#D5D5D1] transition-colors"
                            >
                              {currentVal > 0 ? (trk.type === 'duration' ? formatDuration(currentVal) : `${currentVal} ${trk.unit || ''}`) : 'Log'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#E5E5E1] dark:border-[#282A32] flex justify-end">
              <button
                onClick={() => navigateTo('trackers')}
                className="text-xs font-bold uppercase tracking-wider text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              >
                <span>View all trackers</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Active Goals & Recent Notes */}
      {(dashboard.showActiveGoals || dashboard.showRecentNotes) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboard.showActiveGoals && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                  Active Goals
                </h3>
                <button
                  onClick={onOpenCreateGoal}
                  className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>

              {activeGoals.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#666660] dark:text-[#A1A19D]">
                  <Target className="w-6 h-6 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-[#1A1A1A] dark:text-white">
                    No active goals.
                  </p>
                  <p className="text-[11px] font-serif italic mt-0.5">
                    Set a measurable milestone to track over time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 3).map(goal => {
                    const percent = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
                    return (
                      <div key={goal.id} className="p-3.5 rounded-xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                            {goal.title}
                          </span>
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-white font-mono">
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5E5E1] dark:bg-[#282A32] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%`, backgroundColor: goal.color || '#1A1A1A' }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#666660] dark:text-[#A1A19D]">
                          <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          {goal.deadline && <span>Due: {formatDate(goal.deadline)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {dashboard.showRecentNotes && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                  Recent Notes
                </h3>
                <button
                  onClick={onOpenCreateNote}
                  className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              {recentNotes.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#666660] dark:text-[#A1A19D]">
                  <FileText className="w-6 h-6 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-[#1A1A1A] dark:text-white">
                    No notes recorded yet.
                  </p>
                  <p className="text-[11px] font-serif italic mt-0.5">
                    Create system notes, playbooks, or insights.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => navigateTo('notes')}
                      className="p-3.5 rounded-xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] hover:border-[#1A1A1A] dark:hover:border-white/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                          {note.title}
                        </span>
                        <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] font-mono">
                          {formatDate(note.updatedAt.split('T')[0])}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] line-clamp-1 mt-1 font-serif italic">
                        {note.content || 'Empty note'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 5. Editorial Footer Bar */}
      <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E5E1] dark:border-[#282A32] pt-8 text-[#666660] dark:text-[#A1A19D] text-xs font-medium uppercase tracking-widest gap-4">
        <div className="flex items-center gap-6 sm:gap-8 text-[11px]">
          <span>{completionRate}% TASKS COMPLETED</span>
          <span>{activeTrackers.length} ACTIVE TRACKERS</span>
          <span>{activeGoals.length} ACTIVE GOALS</span>
        </div>
        <div className="font-serif italic text-sm text-[#1A1A1A] dark:text-white normal-case">
          Your life. Your system. Your rules.
        </div>
      </footer>

      {/* Delete Hub Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!hubToDelete}
        title={`Delete "${hubToDelete?.name}" Hub?`}
        message="This will permanently delete this life hub along with all of its associated tasks, trackers, goals, and notes."
        warning="This action cannot be undone."
        confirmLabel="Delete Hub"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDeleteHub}
        onCancel={() => setHubToDelete(null)}
      />
    </div>
  );
};
