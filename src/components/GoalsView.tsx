import React, { useState, useMemo } from 'react';
import {
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Goal, GoalStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatDate, getTodayDateString } from '../utils/date';
import { ConfirmDialog } from './ConfirmDialog';

interface GoalsViewProps {
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  onOpenCreateGoal,
  onEditGoal,
}) => {
  const {
    data,
    updateGoalProgress,
    deleteGoal,
  } = useApp();

  const [selectedHubId, setSelectedHubId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const hubMap = useMemo(() => new Map(data.hubs.map(h => [h.id, h])), [data.hubs]);

  const filteredGoals = useMemo(() => {
    return data.goals.filter(goal => {
      if (selectedHubId !== 'all' && goal.hubId !== selectedHubId) return false;
      if (selectedStatus !== 'all' && goal.status !== selectedStatus) return false;
      return true;
    });
  }, [data.goals, selectedHubId, selectedStatus]);

  const completedGoalsCount = data.goals.filter(g => g.status === 'completed').length;
  const inProgressGoalsCount = data.goals.filter(g => g.status === 'in_progress').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Life Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Turn long-term ambitions into measurable, quantifiable progress
          </p>
        </div>

        <button
          onClick={onOpenCreateGoal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filter and stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#16181E] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
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
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="not_started">Not Started</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{inProgressGoalsCount} in progress</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{completedGoalsCount} achieved</span>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#16181E] border border-dashed border-slate-200 dark:border-slate-800 shadow-xs">
          <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            No goals found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Define your targets and milestones to visualize your trajectory.
          </p>
          <button
            onClick={onOpenCreateGoal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
            const isFinished = goal.status === 'completed' || percent >= 100;
            const hub = goal.hubId ? hubMap.get(goal.hubId) : null;

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#16181E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display truncate">
                          {goal.title}
                        </h3>
                        {hub && (
                          <span
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0"
                            style={{ backgroundColor: hub.color }}
                          >
                            {hub.name}
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-3">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color || '#6366F1',
                      }}
                    />
                  </div>

                  {/* Numerical metrics */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>
                      <strong className="text-slate-900 dark:text-white font-semibold">
                        {goal.currentValue}
                      </strong>{' '}
                      of {goal.targetValue} {goal.unit}
                    </span>

                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Due: {formatDate(goal.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls & Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Decrease by 1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Increase by 1"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.currentValue + 5)}
                      className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                      title="Increase by 5"
                    >
                      +5
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        title={`Delete "${goalToDelete?.title}"?`}
        message="Are you sure you want to permanently delete this goal?"
        confirmLabel="Delete Goal"
        isDestructive={true}
        onConfirm={() => {
          if (goalToDelete) {
            deleteGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  );
};
