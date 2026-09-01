import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Archive,
  Plus,
  CheckSquare,
  Activity,
  Target,
  FileText,
  Layers,
  ChevronDown,
  CheckCircle2,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { Hub } from '../types';
import { useApp } from '../context/AppContext';
import { getIconComponent } from '../utils/icons';
import { formatDate, getTodayDateString, formatDuration } from '../utils/date';
import { ConfirmDialog } from './ConfirmDialog';

interface HubDetailViewProps {
  hubId: string;
  onEditHub: (hub: Hub) => void;
  onOpenCreateTask: (hubId: string) => void;
  onOpenCreateTracker: (hubId: string) => void;
  onOpenCreateGoal: (hubId: string) => void;
  onOpenCreateNote: (hubId: string) => void;
  onOpenTrackerHistory: (trackerId: string) => void;
}

type TabType = 'overview' | 'tasks' | 'trackers' | 'goals' | 'notes';

export const HubDetailView: React.FC<HubDetailViewProps> = ({
  hubId,
  onEditHub,
  onOpenCreateTask,
  onOpenCreateTracker,
  onOpenCreateGoal,
  onOpenCreateNote,
  onOpenTrackerHistory,
}) => {
  const {
    data,
    navigateTo,
    deleteHub,
    archiveHub,
    restoreHub,
    toggleTaskComplete,
    deleteTask,
    deleteTracker,
    deleteGoal,
    deleteNote,
    logTrackerEntry,
    updateGoalProgress,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hub = data.hubs.find(h => h.id === hubId);
  const today = getTodayDateString();

  if (!hub) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h3 className="text-xl font-light text-[#1A1A1A] dark:text-white font-serif mb-2">
          Hub Not Found
        </h3>
        <p className="text-xs text-[#666660] dark:text-[#A1A19D] mb-4">
          The requested life hub does not exist or has been deleted.
        </p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] rounded-full transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const HubIcon = getIconComponent(hub.icon);

  // Hub specific items
  const hubTasks = data.tasks.filter(t => t.hubId === hub.id);
  const hubTrackers = data.trackers.filter(t => t.hubId === hub.id && !t.isArchived);
  const hubGoals = data.goals.filter(g => g.hubId === hub.id);
  const hubNotes = data.notes.filter(n => n.hubId === hub.id);

  const pendingTasks = hubTasks.filter(t => t.status !== 'completed');
  const completedTasks = hubTasks.filter(t => t.status === 'completed');
  const totalItemsCount = hubTasks.length + hubTrackers.length + hubGoals.length + hubNotes.length;

  const handleDeleteConfirmed = () => {
    deleteHub(hub.id, true);
    setShowDeleteConfirm(false);
    showToast(`Hub "${hub.name}" deleted`, 'info');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* 1. Hub Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs relative overflow-hidden">
        {/* Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: hub.color }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigateTo('dashboard')}
              className="p-2 rounded-full text-[#666660] dark:text-[#A1A19D] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] transition-colors shrink-0 mt-1 focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xs shrink-0"
              style={{ backgroundColor: hub.color }}
            >
              <HubIcon className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] dark:text-white font-serif tracking-tight">
                  {hub.name}
                </h1>
                {hub.isArchived && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#666660] dark:text-[#A1A19D] mt-1 font-serif italic">
                {hub.description || 'Dedicated life management workspace'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Add Menu + Hub Settings */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {/* [+ Add] Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-slate-200 rounded-full transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-2xl p-1.5 shadow-xl z-30 animate-slide-up">
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      onOpenCreateTask(hub.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] rounded-xl transition-colors text-left"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>New Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      onOpenCreateTracker(hub.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] rounded-xl transition-colors text-left"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>New Tracker</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      onOpenCreateGoal(hub.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] rounded-xl transition-colors text-left"
                  >
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>New Goal</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      onOpenCreateNote(hub.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] rounded-xl transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    <span>New Note</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hub Edit & Options */}
            <div className="relative">
              <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="p-2 rounded-full text-[#666660] dark:text-[#A1A19D] hover:text-[#1A1A1A] dark:hover:text-white bg-[#F0F0EE] dark:bg-[#202229] hover:bg-[#E5E5E1] transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
                aria-label="Hub Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isOptionsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-2xl p-1.5 shadow-xl z-30 animate-slide-up">
                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onEditHub(hub);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] rounded-xl transition-colors text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 opacity-60" />
                    <span>Edit Hub</span>
                  </button>

                  {hub.isArchived ? (
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        restoreHub(hub.id);
                        showToast(`Hub "${hub.name}" restored`, 'success');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors text-left"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Restore Hub</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOptionsOpen(false);
                        archiveHub(hub.id);
                        showToast(`Hub "${hub.name}" archived`, 'info');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors text-left"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Hub</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-[#E5E5E1] dark:border-[#282A32]" />

                  <button
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Hub</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 border-b border-[#E5E5E1] dark:border-[#282A32] pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'tasks', label: `Tasks (${hubTasks.length})` },
            { id: 'trackers', label: `Trackers (${hubTrackers.length})` },
            { id: 'goals', label: `Goals (${hubGoals.length})` },
            { id: 'notes', label: `Notes (${hubNotes.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none ${
                activeTab === tab.id
                  ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-2xs'
                  : 'text-[#666660] dark:text-[#A1A19D] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tab Contents */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {totalItemsCount === 0 ? (
            <div className="py-14 px-6 rounded-3xl border border-dashed border-[#E5E5E1] dark:border-[#282A32] bg-white dark:bg-[#181A1F] text-center shadow-xs">
              <Layers className="w-10 h-10 text-[#666660] dark:text-[#A1A19D] mx-auto mb-3 opacity-60" />
              <h3 className="text-xl font-light text-[#1A1A1A] dark:text-white font-serif">
                This hub is currently empty
              </h3>
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
                Add tasks, trackers, goals, or notes to build out this area of your life.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => onOpenCreateTask(hub.id)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#202229] dark:hover:bg-[#282A32] rounded-full border border-[#E5E5E1] dark:border-[#282A32] transition-colors"
                >
                  + Add Task
                </button>
                <button
                  onClick={() => onOpenCreateTracker(hub.id)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#202229] dark:hover:bg-[#282A32] rounded-full border border-[#E5E5E1] dark:border-[#282A32] transition-colors"
                >
                  + Add Tracker
                </button>
                <button
                  onClick={() => onOpenCreateGoal(hub.id)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#202229] dark:hover:bg-[#282A32] rounded-full border border-[#E5E5E1] dark:border-[#282A32] transition-colors"
                >
                  + Add Goal
                </button>
                <button
                  onClick={() => onOpenCreateNote(hub.id)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#202229] dark:hover:bg-[#282A32] rounded-full border border-[#E5E5E1] dark:border-[#282A32] transition-colors"
                >
                  + Add Note
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks Quick Section */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                    Pending Tasks ({pendingTasks.length})
                  </h3>
                  <button
                    onClick={() => onOpenCreateTask(hub.id)}
                    className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add
                  </button>
                </div>
                {pendingTasks.length === 0 ? (
                  <p className="text-xs text-[#666660] dark:text-[#A1A19D] py-4 text-center font-serif italic">
                    All tasks completed in this hub.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 4).map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="w-4 h-4 rounded border border-[#CCCCCC] dark:border-[#444] hover:border-[#1A1A1A] shrink-0"
                            aria-label={`Complete task ${task.title}`}
                          />
                          <span className="text-xs font-medium text-[#1A1A1A] dark:text-white truncate">
                            {task.title}
                          </span>
                        </div>
                        {task.dueDate && (
                          <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] font-mono shrink-0 ml-2">
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trackers Quick Section */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
                    Trackers ({hubTrackers.length})
                  </h3>
                  <button
                    onClick={() => onOpenCreateTracker(hub.id)}
                    className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add
                  </button>
                </div>
                {hubTrackers.length === 0 ? (
                  <p className="text-xs text-[#666660] dark:text-[#A1A19D] py-4 text-center font-serif italic">
                    No active trackers assigned to this hub.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {hubTrackers.slice(0, 4).map(trk => {
                      const TrkIcon = getIconComponent(trk.icon);
                      const todayEntry = data.trackerEntries.find(e => e.trackerId === trk.id && e.date === today);
                      const currentVal = todayEntry ? todayEntry.value : 0;

                      return (
                        <div
                          key={trk.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white shrink-0 text-xs"
                              style={{ backgroundColor: trk.color }}
                            >
                              <TrkIcon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-medium text-[#1A1A1A] dark:text-white truncate">
                              {trk.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {trk.type === 'boolean' ? (
                              <button
                                onClick={() => logTrackerEntry(trk.id, today, currentVal ? 0 : 1)}
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                  currentVal >= 1
                                    ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                                    : 'bg-[#E5E5E1] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white'
                                }`}
                              >
                                {currentVal >= 1 ? '✓ Done' : 'Mark'}
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenTrackerHistory(trk.id)}
                                className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-[#E5E5E1] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white hover:bg-[#D5D5D1]"
                              >
                                {currentVal > 0 ? `${currentVal} ${trk.unit || ''}` : 'Log'}
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
          )}
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
              All Hub Tasks ({hubTasks.length})
            </span>
            <button
              onClick={() => onOpenCreateTask(hub.id)}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] rounded-full transition-all"
            >
              + New Task
            </button>
          </div>

          {hubTasks.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32]">
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic">
                No tasks assigned to {hub.name} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {hubTasks.map(task => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-[#F9F9F7] dark:bg-[#121418] border-[#E5E5E1]/60 dark:border-[#282A32] text-[#666660]'
                        : 'bg-white dark:bg-[#181A1F] border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isDone
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white dark:bg-white dark:border-white dark:text-[#1A1A1A]'
                            : 'border-[#CCCCCC] dark:border-[#444] hover:border-[#1A1A1A]'
                        }`}
                        aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isDone ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.dueDate && (
                        <span className="text-[10px] font-mono text-[#666660] dark:text-[#A1A19D]">
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-[#666660] hover:text-rose-600 transition-colors"
                        title="Delete Task"
                        aria-label={`Delete task ${task.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TRACKERS TAB */}
      {activeTab === 'trackers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
              Hub Trackers ({hubTrackers.length})
            </span>
            <button
              onClick={() => onOpenCreateTracker(hub.id)}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] rounded-full transition-all"
            >
              + New Tracker
            </button>
          </div>

          {hubTrackers.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32]">
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic">
                No trackers created in this hub yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hubTrackers.map(trk => {
                const TrkIcon = getIconComponent(trk.icon);
                const todayEntry = data.trackerEntries.find(e => e.trackerId === trk.id && e.date === today);
                const currentVal = todayEntry ? todayEntry.value : 0;

                return (
                  <div
                    key={trk.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: trk.color }}
                        >
                          <TrkIcon className="w-4 h-4 text-white" />
                        </div>
                        <button
                          onClick={() => onOpenTrackerHistory(trk.id)}
                          className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          History
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                        {trk.name}
                      </h4>
                      <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] font-serif italic mt-0.5 capitalize">
                        {trk.frequency} · {trk.type}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E5E5E1] dark:border-[#282A32] flex items-center justify-between">
                      <span className="text-[11px] text-[#666660] dark:text-[#A1A19D]">
                        Today: <strong className="text-[#1A1A1A] dark:text-white font-mono">{currentVal} {trk.unit || ''}</strong>
                      </span>
                      <button
                        onClick={() => {
                          if (trk.type === 'boolean') {
                            logTrackerEntry(trk.id, today, currentVal ? 0 : 1);
                          } else if (trk.type === 'counter') {
                            logTrackerEntry(trk.id, today, currentVal + 1);
                          } else {
                            onOpenTrackerHistory(trk.id);
                          }
                        }}
                        className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-slate-200 transition-colors"
                      >
                        {trk.type === 'boolean' ? (currentVal ? '✓ Logged' : 'Mark') : '+ Log'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GOALS TAB */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
              Hub Goals ({hubGoals.length})
            </span>
            <button
              onClick={() => onOpenCreateGoal(hub.id)}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] rounded-full transition-all"
            >
              + New Goal
            </button>
          </div>

          {hubGoals.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32]">
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic">
                No goals created in this hub yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hubGoals.map(goal => {
                const percent = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                        {goal.title}
                      </span>
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-white font-mono">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#F0F0EE] dark:bg-[#282A32] rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: goal.color || '#1A1A1A' }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#666660] dark:text-[#A1A19D]">
                      <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <div className="flex items-center gap-3">
                        {goal.deadline && <span>Due {formatDate(goal.deadline)}</span>}
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-rose-500 hover:text-rose-700"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
              Hub Notes ({hubNotes.length})
            </span>
            <button
              onClick={() => onOpenCreateNote(hub.id)}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] rounded-full transition-all"
            >
              + New Note
            </button>
          </div>

          {hubNotes.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32]">
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic">
                No notes in this hub yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hubNotes.map(note => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                        {note.title}
                      </h4>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-[#666660] hover:text-rose-600 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#666660] dark:text-[#A1A19D] line-clamp-3 font-serif italic leading-relaxed">
                      {note.content || 'Empty note'}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E5E5E1] dark:border-[#282A32] text-[10px] text-[#666660] dark:text-[#A1A19D] font-mono">
                    Updated {formatDate(note.updatedAt.split('T')[0])}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`Delete "${hub.name}" Hub?`}
        message="This will permanently delete this life hub along with all associated tasks, trackers, goals, and notes."
        warning="This action cannot be undone."
        confirmLabel="Delete Hub"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
