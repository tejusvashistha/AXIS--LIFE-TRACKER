import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppData,
  ActiveView,
  Hub,
  Tracker,
  TrackerEntry,
  Task,
  Goal,
  Note,
  ThemeMode,
  UserProfile,
  UserSettings,
  TrackerType
} from '../types';
import {
  loadAppData,
  saveAppData,
  exportAppDataJSON,
  parseImportedJSON,
  getCleanAppData,
  getSampleTemplateData
} from '../services/storage';
import { getTodayDateString, getPastNDays } from '../utils/date';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  data: AppData;
  activeView: ActiveView;
  selectedHubId: string | null;
  searchQuery: string;
  isSearchOpen: boolean;
  isCustomizeDashboardOpen: boolean;
  toasts: ToastState[];
  currentTheme: 'light' | 'dark'; // Effective computed theme
  
  // Navigation
  navigateTo: (view: ActiveView, hubId?: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsCustomizeDashboardOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Hubs
  createHub: (hub: { name: string; description?: string; icon: string; color: string; coverImage?: string }) => Hub;
  updateHub: (id: string, updates: Partial<Hub>) => void;
  deleteHub: (id: string, cascade?: boolean) => { deletedHub: Hub; tasksCount: number; trackersCount: number; goalsCount: number; notesCount: number };
  archiveHub: (id: string) => void;
  restoreHub: (id: string) => void;
  reorderHubs: (orderedIds: string[]) => void;
  
  // Trackers
  createTracker: (tracker: Omit<Tracker, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => Tracker;
  updateTracker: (id: string, updates: Partial<Tracker>) => void;
  deleteTracker: (id: string) => void;
  archiveTracker: (id: string) => void;
  logTrackerEntry: (trackerId: string, date: string, value: number, notes?: string) => TrackerEntry;
  deleteTrackerEntry: (entryId: string) => void;
  getTrackerTodayEntry: (trackerId: string) => TrackerEntry | undefined;
  getTrackerEntries: (trackerId: string) => TrackerEntry[];
  getTrackerStreak: (trackerId: string) => number;
  getTrackerWeeklyStats: (trackerId: string) => { date: string; value: number; metTarget: boolean }[];
  
  // Tasks
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Goals
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  updateGoalProgress: (id: string, newCurrentValue: number) => void;
  deleteGoal: (id: string) => void;
  
  // Notes
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
  
  // Settings & Profile
  setTheme: (theme: ThemeMode) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  exportData: () => void;
  importData: (jsonString: string) => void;
  clearAllData: () => void;
  loadSampleData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomizeDashboardOpen, setIsCustomizeDashboardOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Watch system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else if ((media as any).addListener) {
      (media as any).addListener(listener);
      return () => (media as any).removeListener(listener);
    }
  }, []);

  // Compute effective theme
  const effectiveTheme: 'light' | 'dark' = useMemo(() => {
    const pref = data.settings.theme;
    if (pref === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return pref;
  }, [data.settings.theme, systemIsDark]);

  // Sync dark class and color-scheme on document element
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [effectiveTheme]);

  // Persist state to localStorage on every change
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Browser History Navigation Integration
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setActiveView(e.state.view);
        setSelectedHubId(e.state.hubId || null);
      } else {
        setActiveView('dashboard');
        setSelectedHubId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((view: ActiveView, hubId: string | null = null) => {
    setActiveView(view);
    setSelectedHubId(hubId);
    try {
      window.history.pushState({ view, hubId }, '', hubId ? `#${view}/${hubId}` : `#${view}`);
    } catch {
      // Ignore if pushState fails in iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ================= HUBS =================
  const createHub = useCallback((hubInput: { name: string; description?: string; icon: string; color: string; coverImage?: string }): Hub => {
    const newHub: Hub = {
      id: `hub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: hubInput.name.trim(),
      description: hubInput.description?.trim() || '',
      icon: hubInput.icon || 'folder',
      color: hubInput.color || '#6366F1',
      coverImage: hubInput.coverImage,
      order: data.hubs.length,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      hubs: [...prev.hubs, newHub],
      settings: {
        ...prev.settings,
        dashboard: {
          ...prev.settings.dashboard,
          hubOrder: [...prev.settings.dashboard.hubOrder, newHub.id],
        },
      },
    }));

    showToast(`Hub "${newHub.name}" created`, 'success');
    return newHub;
  }, [data.hubs.length, showToast]);

  const updateHub = useCallback((id: string, updates: Partial<Hub>) => {
    setData(prev => ({
      ...prev,
      hubs: prev.hubs.map(h => h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h),
    }));
    showToast('Hub updated', 'success');
  }, [showToast]);

  const deleteHub = useCallback((id: string, cascade: boolean = true) => {
    const hubToDelete = data.hubs.find(h => h.id === id);
    if (!hubToDelete) {
      return { deletedHub: {} as Hub, tasksCount: 0, trackersCount: 0, goalsCount: 0, notesCount: 0 };
    }

    const tasksCount = data.tasks.filter(t => t.hubId === id).length;
    const trackersCount = data.trackers.filter(t => t.hubId === id).length;
    const goalsCount = data.goals.filter(g => g.hubId === id).length;
    const notesCount = data.notes.filter(n => n.hubId === id).length;

    setData(prev => {
      const remainingHubs = prev.hubs.filter(h => h.id !== id);
      const remainingHubOrder = prev.settings.dashboard.hubOrder.filter(hubId => hubId !== id);

      if (!cascade) {
        // Unassign hubId instead of deleting children
        return {
          ...prev,
          hubs: remainingHubs,
          tasks: prev.tasks.map(t => t.hubId === id ? { ...t, hubId: null } : t),
          trackers: prev.trackers.map(t => t.hubId === id ? { ...t, hubId: null } : t),
          goals: prev.goals.map(g => g.hubId === id ? { ...g, hubId: null } : g),
          notes: prev.notes.map(n => n.hubId === id ? { ...n, hubId: null } : n),
          settings: {
            ...prev.settings,
            dashboard: { ...prev.settings.dashboard, hubOrder: remainingHubOrder },
          },
        };
      }

      // Cascade delete items and their entries
      const trackerIdsToDelete = prev.trackers.filter(t => t.hubId === id).map(t => t.id);
      return {
        ...prev,
        hubs: remainingHubs,
        tasks: prev.tasks.filter(t => t.hubId !== id),
        trackers: prev.trackers.filter(t => t.hubId !== id),
        trackerEntries: prev.trackerEntries.filter(e => !trackerIdsToDelete.includes(e.trackerId)),
        goals: prev.goals.filter(g => g.hubId !== id),
        notes: prev.notes.filter(n => n.hubId !== id),
        settings: {
          ...prev.settings,
          dashboard: { ...prev.settings.dashboard, hubOrder: remainingHubOrder },
        },
      };
    });

    if (selectedHubId === id) {
      navigateTo('dashboard');
    }

    showToast(`Hub "${hubToDelete.name}" deleted`, 'info');
    return { deletedHub: hubToDelete, tasksCount, trackersCount, goalsCount, notesCount };
  }, [data.hubs, data.tasks, data.trackers, data.goals, data.notes, selectedHubId, navigateTo, showToast]);

  const archiveHub = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      hubs: prev.hubs.map(h => h.id === id ? { ...h, isArchived: true, updatedAt: new Date().toISOString() } : h),
    }));
    showToast('Hub moved to archive', 'info');
  }, [showToast]);

  const restoreHub = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      hubs: prev.hubs.map(h => h.id === id ? { ...h, isArchived: false, updatedAt: new Date().toISOString() } : h),
    }));
    showToast('Hub restored', 'success');
  }, [showToast]);

  const reorderHubs = useCallback((orderedIds: string[]) => {
    setData(prev => {
      const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
      const updatedHubs = [...prev.hubs].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? a.order;
        const orderB = orderMap.get(b.id) ?? b.order;
        return orderA - orderB;
      }).map((hub, idx) => ({ ...hub, order: idx }));

      return {
        ...prev,
        hubs: updatedHubs,
        settings: {
          ...prev.settings,
          dashboard: { ...prev.settings.dashboard, hubOrder: orderedIds },
        },
      };
    });
  }, []);

  // ================= TRACKERS =================
  const createTracker = useCallback((trackerInput: Omit<Tracker, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): Tracker => {
    const newTracker: Tracker = {
      ...trackerInput,
      id: `trk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      trackers: [...prev.trackers, newTracker],
    }));

    showToast(`Tracker "${newTracker.name}" created`, 'success');
    return newTracker;
  }, [showToast]);

  const updateTracker = useCallback((id: string, updates: Partial<Tracker>) => {
    setData(prev => ({
      ...prev,
      trackers: prev.trackers.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
    }));
    showToast('Tracker updated', 'success');
  }, [showToast]);

  const deleteTracker = useCallback((id: string) => {
    const trk = data.trackers.find(t => t.id === id);
    setData(prev => ({
      ...prev,
      trackers: prev.trackers.filter(t => t.id !== id),
      trackerEntries: prev.trackerEntries.filter(e => e.trackerId !== id),
    }));
    showToast(`Tracker "${trk?.name || ''}" deleted`, 'info');
  }, [data.trackers, showToast]);

  const archiveTracker = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      trackers: prev.trackers.map(t => t.id === id ? { ...t, isArchived: true, updatedAt: new Date().toISOString() } : t),
    }));
    showToast('Tracker archived', 'info');
  }, [showToast]);

  const logTrackerEntry = useCallback((trackerId: string, date: string, value: number, notes?: string): TrackerEntry => {
    const existing = data.trackerEntries.find(e => e.trackerId === trackerId && e.date === date);
    const now = new Date().toISOString();

    if (existing) {
      const updated: TrackerEntry = { ...existing, value, notes, updatedAt: now };
      setData(prev => ({
        ...prev,
        trackerEntries: prev.trackerEntries.map(e => e.id === existing.id ? updated : e),
      }));
      return updated;
    } else {
      const newEntry: TrackerEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        trackerId,
        date,
        value,
        notes,
        createdAt: now,
        updatedAt: now,
      };
      setData(prev => ({
        ...prev,
        trackerEntries: [...prev.trackerEntries, newEntry],
      }));
      return newEntry;
    }
  }, [data.trackerEntries]);

  const deleteTrackerEntry = useCallback((entryId: string) => {
    setData(prev => ({
      ...prev,
      trackerEntries: prev.trackerEntries.filter(e => e.id !== entryId),
    }));
    showToast('Entry removed', 'info');
  }, [showToast]);

  const getTrackerTodayEntry = useCallback((trackerId: string): TrackerEntry | undefined => {
    const today = getTodayDateString();
    return data.trackerEntries.find(e => e.trackerId === trackerId && e.date === today);
  }, [data.trackerEntries]);

  const getTrackerEntries = useCallback((trackerId: string): TrackerEntry[] => {
    return data.trackerEntries
      .filter(e => e.trackerId === trackerId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.trackerEntries]);

  const getTrackerStreak = useCallback((trackerId: string): number => {
    const tracker = data.trackers.find(t => t.id === trackerId);
    if (!tracker) return 0;

    const entriesMap = new Map<string, number>();
    data.trackerEntries
      .filter(e => e.trackerId === trackerId)
      .forEach(e => entriesMap.set(e.date, e.value));

    if (entriesMap.size === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isMet = (val: number | undefined): boolean => {
      if (val === undefined || val === null) return false;
      if (tracker.type === 'boolean') return val >= 1;
      if (tracker.target && tracker.target > 0) return val >= tracker.target;
      return val > 0;
    };

    // Check today first
    const todayStr = getTodayDateString();
    const todayMet = isMet(entriesMap.get(todayStr));

    // If today is met, streak starts from today; otherwise check yesterday
    let checkDate = new Date(today);
    if (!todayMet) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (isMet(entriesMap.get(dateStr))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [data.trackers, data.trackerEntries]);

  const getTrackerWeeklyStats = useCallback((trackerId: string): { date: string; value: number; metTarget: boolean }[] => {
    const tracker = data.trackers.find(t => t.id === trackerId);
    const past7 = getPastNDays(7);
    const entriesMap = new Map<string, number>();

    data.trackerEntries
      .filter(e => e.trackerId === trackerId)
      .forEach(e => entriesMap.set(e.date, e.value));

    return past7.map(date => {
      const val = entriesMap.get(date) || 0;
      let met = false;
      if (tracker) {
        if (tracker.type === 'boolean') met = val >= 1;
        else if (tracker.target && tracker.target > 0) met = val >= tracker.target;
        else met = val > 0;
      }
      return { date, value: val, metTarget: met };
    });
  }, [data.trackers, data.trackerEntries]);

  // ================= TASKS =================
  const createTask = useCallback((taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Task => {
    const newTask: Task = {
      ...taskInput,
      id: `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      order: data.tasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    showToast(`Task added`, 'success');
    return newTask;
  }, [data.tasks.length, showToast]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
    }));
    showToast('Task updated', 'success');
  }, [showToast]);

  const toggleTaskComplete = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== id) return t;
        const willBeDone = t.status !== 'completed';
        return {
          ...t,
          status: willBeDone ? 'completed' : 'todo',
          completedAt: willBeDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
    showToast('Task deleted', 'info');
  }, [showToast]);

  // ================= GOALS =================
  const createGoal = useCallback((goalInput: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal => {
    const newGoal: Goal = {
      ...goalInput,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));

    showToast(`Goal "${newGoal.title}" created`, 'success');
    return newGoal;
  }, [showToast]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g),
    }));
    showToast('Goal updated', 'success');
  }, [showToast]);

  const updateGoalProgress = useCallback((id: string, newCurrentValue: number) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== id) return g;
        const isCompleted = g.targetValue > 0 && newCurrentValue >= g.targetValue;
        return {
          ...g,
          currentValue: newCurrentValue,
          status: isCompleted ? 'completed' : (newCurrentValue > 0 ? 'in_progress' : g.status),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
    }));
    showToast('Goal deleted', 'info');
  }, [showToast]);

  // ================= NOTES =================
  const createNote = useCallback((noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const newNote: Note = {
      ...noteInput,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));

    showToast('Note created', 'success');
    return newNote;
  }, [showToast]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
    }));
    showToast('Note updated', 'success');
  }, [showToast]);

  const togglePinNote = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
    }));
    showToast('Note deleted', 'info');
  }, [showToast]);

  // ================= SETTINGS & PROFILE =================
  const setTheme = useCallback((theme: ThemeMode) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, theme },
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    showToast('Settings saved', 'success');
  }, [showToast]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
    showToast('Profile updated', 'success');
  }, [showToast]);

  const exportData = useCallback(() => {
    exportAppDataJSON(data);
    showToast('Backup JSON downloaded', 'success');
  }, [data, showToast]);

  const importData = useCallback((jsonString: string) => {
    try {
      const parsed = parseImportedJSON(jsonString);
      setData(parsed);
      showToast('Data successfully imported', 'success');
      navigateTo('dashboard');
    } catch (e: any) {
      showToast(e?.message || 'Failed to import JSON file', 'error');
    }
  }, [navigateTo, showToast]);

  const clearAllData = useCallback(() => {
    const clean = getCleanAppData();
    setData(clean);
    saveAppData(clean);
    navigateTo('dashboard');
    showToast('Workspace reset to clean state', 'info');
  }, [navigateTo, showToast]);

  const loadSampleData = useCallback(() => {
    const sample = getSampleTemplateData();
    setData(sample);
    saveAppData(sample);
    navigateTo('dashboard');
    showToast('Starter template loaded', 'success');
  }, [navigateTo, showToast]);

  const value: AppContextValue = {
    data,
    activeView,
    selectedHubId,
    searchQuery,
    isSearchOpen,
    isCustomizeDashboardOpen,
    toasts,
    currentTheme: effectiveTheme,
    navigateTo,
    setSearchQuery,
    setIsSearchOpen,
    setIsCustomizeDashboardOpen,
    showToast,
    removeToast,
    createHub,
    updateHub,
    deleteHub,
    archiveHub,
    restoreHub,
    reorderHubs,
    createTracker,
    updateTracker,
    deleteTracker,
    archiveTracker,
    logTrackerEntry,
    deleteTrackerEntry,
    getTrackerTodayEntry,
    getTrackerEntries,
    getTrackerStreak,
    getTrackerWeeklyStats,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    createNote,
    updateNote,
    togglePinNote,
    deleteNote,
    setTheme,
    updateSettings,
    updateProfile,
    exportData,
    importData,
    clearAllData,
    loadSampleData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
