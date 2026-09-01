import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckSquare,
  Filter,
  Calendar,
  Flag,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Tag,
  Search
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useApp } from '../context/AppContext';
import { getTodayDateString, formatDate, isOverdue } from '../utils/date';
import { ConfirmDialog } from './ConfirmDialog';

interface TasksViewProps {
  onOpenCreateTask: () => void;
  onEditTask: (task: Task) => void;
}

type FilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenCreateTask,
  onEditTask,
}) => {
  const {
    data,
    createTask,
    toggleTaskComplete,
    deleteTask,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedHubId, setSelectedHubId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const today = getTodayDateString();
  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const hubMap = useMemo(() => new Map(data.hubs.map(h => [h.id, h])), [data.hubs]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    createTask({
      title: quickTitle.trim(),
      dueDate: today,
      priority: 'medium',
      status: 'todo',
      hubId: selectedHubId !== 'all' ? selectedHubId : null,
      tags: [],
    });
    setQuickTitle('');
  };

  // Filter logic
  const filteredTasks = useMemo(() => {
    return data.tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchTags = task.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      // Hub Filter
      if (selectedHubId !== 'all' && task.hubId !== selectedHubId) {
        return false;
      }

      // Priority Filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Status/Date Filter
      if (activeFilter === 'today') {
        return task.dueDate === today && task.status !== 'completed';
      }
      if (activeFilter === 'upcoming') {
        return task.dueDate && task.dueDate > today && task.status !== 'completed';
      }
      if (activeFilter === 'overdue') {
        return isOverdue(task.dueDate) && task.status !== 'completed';
      }
      if (activeFilter === 'completed') {
        return task.status === 'completed';
      }

      // 'all' includes pending by default, or all
      return true;
    });
  }, [data.tasks, activeFilter, selectedHubId, selectedPriority, searchQuery, today]);

  const pendingCount = data.tasks.filter(t => t.status !== 'completed').length;
  const completedCount = data.tasks.filter(t => t.status === 'completed').length;
  const overdueCount = data.tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E1] dark:border-[#282A32]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light italic font-serif text-[#1A1A1A] dark:text-white tracking-tight">
            Tasks & Actions.
          </h1>
          <p className="text-xs sm:text-sm text-[#666660] dark:text-[#A1A19D] mt-1">
            Organize, prioritize, and check off your daily responsibilities
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-slate-200 rounded-full transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            placeholder="Quick add task due today (press Enter)..."
            className="w-full pl-4 pr-4 py-2.5 text-xs rounded-full bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white placeholder:text-[#888880] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-white shadow-2xs transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-slate-200 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Add
        </button>
      </form>

      {/* Filter Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#181A1F] p-3 rounded-2xl border border-[#E5E5E1] dark:border-[#282A32] shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: `Overdue ${overdueCount > 0 ? `(${overdueCount})` : ''}` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterType)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-2xs'
                  : 'text-[#666660] dark:text-[#A1A19D] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#22242B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Hub & Priority filters */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedHubId}
            onChange={e => setSelectedHubId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-full bg-[#F0F0EE] dark:bg-[#22242B] border border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white focus:outline-none"
          >
            <option value="all">All Hubs</option>
            {activeHubs.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-full bg-[#F0F0EE] dark:bg-[#22242B] border border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#181A1F] border border-dashed border-[#E5E5E1] dark:border-[#282A32] shadow-xs">
          <CheckSquare className="w-8 h-8 text-[#888880] mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-medium text-[#1A1A1A] dark:text-white font-serif">
            No tasks found
          </h3>
          <p className="text-xs text-[#666660] dark:text-[#A1A19D] mt-1 max-w-sm mx-auto font-serif italic">
            {searchQuery || activeFilter !== 'all' || selectedHubId !== 'all'
              ? 'No tasks match the selected filter criteria.'
              : 'Your task list is clean and clear. Add a task above to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map(task => {
            const isDone = task.status === 'completed';
            const hub = task.hubId ? hubMap.get(task.hubId) : null;
            const taskIsOverdue = !isDone && isOverdue(task.dueDate);

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-xs shadow-xs ${
                  isDone
                    ? 'bg-[#F9F9F7]/70 dark:bg-[#121418]/60 border-[#E5E5E1]/60 dark:border-[#282A32]/60'
                    : 'bg-white dark:bg-[#181A1F] border-[#E5E5E1] dark:border-[#282A32] hover:border-[#1A1A1A] dark:hover:border-white/50'
                }`}
              >
                {/* Left checkbox and details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                      isDone
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white dark:bg-white dark:border-white dark:text-[#1A1A1A]'
                        : 'border-[#CCCCCC] dark:border-[#444] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags, date, hub */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                      {task.dueDate && (
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            taskIsOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                          {taskIsOverdue && ' (Overdue)'}
                        </span>
                      )}

                      {hub && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white"
                          style={{ backgroundColor: hub.color }}
                        >
                          {hub.name}
                        </span>
                      )}

                      {task.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Priority & Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : task.priority === 'medium'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
