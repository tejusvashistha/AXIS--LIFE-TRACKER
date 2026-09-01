import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './components/DashboardView';
import { HubDetailView } from './components/HubDetailView';
import { TasksView } from './components/TasksView';
import { TrackersView } from './components/TrackersView';
import { GoalsView } from './components/GoalsView';
import { NotesView } from './components/NotesView';
import { DailyCalendarView } from './components/DailyCalendarView';
import { SettingsView } from './components/SettingsView';

// Modals
import { HubModal } from './components/HubModal';
import { TrackerModal } from './components/TrackerModal';
import { TrackerHistoryModal } from './components/TrackerHistoryModal';
import { TaskModal } from './components/TaskModal';
import { GoalModal } from './components/GoalModal';
import { NoteModal } from './components/NoteModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CustomizeDashboardModal } from './components/CustomizeDashboardModal';

import { Hub, Tracker, Task, Goal, Note } from './types';

const MainAppContent: React.FC = () => {
  const {
    data,
    activeView,
    selectedHubId,
    createHub,
    updateHub,
    createTracker,
    updateTracker,
    createTask,
    updateTask,
    createGoal,
    updateGoal,
    createNote,
    updateNote,
  } = useApp();

  // Modal states
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);

  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
  const [trackerDefaultHubId, setTrackerDefaultHubId] = useState<string | null>(null);

  const [isTrackerHistoryOpen, setIsTrackerHistoryOpen] = useState(false);
  const [activeHistoryTracker, setActiveHistoryTracker] = useState<Tracker | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaultHubId, setTaskDefaultHubId] = useState<string | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDefaultHubId, setGoalDefaultHubId] = useState<string | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteDefaultHubId, setNoteDefaultHubId] = useState<string | null>(null);

  // Hub Modal Handlers
  const handleOpenCreateHub = () => {
    setEditingHub(null);
    setIsHubModalOpen(true);
  };

  const handleEditHub = (hub: Hub) => {
    setEditingHub(hub);
    setIsHubModalOpen(true);
  };

  const handleSaveHub = (hubData: Omit<Hub, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    if (editingHub) {
      updateHub(editingHub.id, hubData);
    } else {
      createHub(hubData);
    }
  };

  // Tracker Modal Handlers
  const handleOpenCreateTracker = (hubId?: string) => {
    setEditingTracker(null);
    setTrackerDefaultHubId(hubId || null);
    setIsTrackerModalOpen(true);
  };

  const handleEditTracker = (tracker: Tracker) => {
    setEditingTracker(tracker);
    setTrackerDefaultHubId(tracker.hubId);
    setIsTrackerModalOpen(true);
  };

  const handleSaveTracker = (trackerData: Omit<Tracker, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    if (editingTracker) {
      updateTracker(editingTracker.id, trackerData);
    } else {
      createTracker(trackerData as any);
    }
  };

  const handleOpenTrackerHistory = (trackerId: string) => {
    const trk = data.trackers.find(t => t.id === trackerId);
    if (trk) {
      setActiveHistoryTracker(trk);
      setIsTrackerHistoryOpen(true);
    }
  };

  // Task Modal Handlers
  const handleOpenCreateTask = (hubId?: string) => {
    setEditingTask(null);
    setTaskDefaultHubId(hubId || null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDefaultHubId(task.hubId);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      createTask(taskData);
    }
  };

  // Goal Modal Handlers
  const handleOpenCreateGoal = (hubId?: string) => {
    setEditingGoal(null);
    setGoalDefaultHubId(hubId || null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalDefaultHubId(goal.hubId);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      createGoal(goalData);
    }
  };

  // Note Modal Handlers
  const handleOpenCreateNote = (hubId?: string) => {
    setEditingNote(null);
    setNoteDefaultHubId(hubId || null);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteDefaultHubId(note.hubId);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      createNote(noteData);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0F1012] text-[#1A1A1A] dark:text-[#F3F3F1] flex flex-col font-sans transition-colors duration-150 selection:bg-[#1A1A1A] selection:text-white dark:selection:bg-white dark:selection:text-[#0F1012]">
      {/* Persistent Navigation Bar */}
      <Navbar onOpenCreateHub={handleOpenCreateHub} />

      {/* Main Responsive Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar */}
        <Sidebar onOpenCreateHub={handleOpenCreateHub} />

        {/* View Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenCreateHub={handleOpenCreateHub}
              onOpenCreateTask={() => handleOpenCreateTask()}
              onOpenCreateTracker={() => handleOpenCreateTracker()}
              onOpenCreateGoal={() => handleOpenCreateGoal()}
              onOpenCreateNote={() => handleOpenCreateNote()}
            />
          )}

          {activeView === 'hub-detail' && selectedHubId && (
            <HubDetailView
              hubId={selectedHubId}
              onEditHub={handleEditHub}
              onOpenCreateTask={handleOpenCreateTask}
              onOpenCreateTracker={handleOpenCreateTracker}
              onOpenCreateGoal={handleOpenCreateGoal}
              onOpenCreateNote={handleOpenCreateNote}
              onOpenTrackerHistory={handleOpenTrackerHistory}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              onOpenCreateTask={() => handleOpenCreateTask()}
              onEditTask={handleEditTask}
            />
          )}

          {activeView === 'trackers' && (
            <TrackersView
              onOpenCreateTracker={() => handleOpenCreateTracker()}
              onEditTracker={handleEditTracker}
              onOpenHistory={handleOpenTrackerHistory}
            />
          )}

          {activeView === 'goals' && (
            <GoalsView
              onOpenCreateGoal={() => handleOpenCreateGoal()}
              onEditGoal={handleEditGoal}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              onOpenCreateNote={() => handleOpenCreateNote()}
              onEditNote={handleEditNote}
            />
          )}

          {activeView === 'daily' && (
            <DailyCalendarView
              onOpenCreateTask={handleOpenCreateTask}
              onOpenCreateTracker={handleOpenCreateTracker}
              onOpenTrackerHistory={handleOpenTrackerHistory}
            />
          )}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* All System Modals */}
      <HubModal
        isOpen={isHubModalOpen}
        onClose={() => setIsHubModalOpen(false)}
        onSave={handleSaveHub}
        editingHub={editingHub}
      />

      <TrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        onSave={handleSaveTracker}
        editingTracker={editingTracker}
        defaultHubId={trackerDefaultHubId}
      />

      <TrackerHistoryModal
        isOpen={isTrackerHistoryOpen}
        onClose={() => setIsTrackerHistoryOpen(false)}
        tracker={activeHistoryTracker}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        defaultHubId={taskDefaultHubId}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
        defaultHubId={goalDefaultHubId}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        editingNote={editingNote}
        defaultHubId={noteDefaultHubId}
      />

      <GlobalSearchModal />
      <CustomizeDashboardModal />

      {/* Global Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
