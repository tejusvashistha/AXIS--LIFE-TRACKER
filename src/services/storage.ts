import { AppData, Hub, Tracker, TrackerEntry, Task, Goal, Note, UserProfile, UserSettings } from '../types';
import { getTodayDateString } from '../utils/date';

const STORAGE_KEY = 'lifeos_app_data_v1';

export const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Workspace Owner',
  email: '',
  plan: 'free',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  currency: '$',
  startOfWeek: 1, // Monday
  notificationsEnabled: true,
  soundEffects: false,
  dashboard: {
    showGreeting: true,
    showQuickStats: true,
    showHubs: true,
    showDailyFocus: true,
    showActiveGoals: true,
    showRecentNotes: true,
    hubViewMode: 'grid',
    hubOrder: [],
  },
};

export function getCleanAppData(): AppData {
  return {
    version: 1,
    hubs: [],
    trackers: [],
    trackerEntries: [],
    tasks: [],
    goals: [],
    notes: [],
    profile: { ...DEFAULT_PROFILE },
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const clean = getCleanAppData();
      saveAppData(clean);
      return clean;
    }
    const parsed = JSON.parse(raw) as AppData;
    
    // Ensure all required arrays and objects exist gracefully
    return {
      version: parsed.version || 1,
      hubs: Array.isArray(parsed.hubs) ? parsed.hubs : [],
      trackers: Array.isArray(parsed.trackers) ? parsed.trackers : [],
      trackerEntries: Array.isArray(parsed.trackerEntries) ? parsed.trackerEntries : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        dashboard: {
          ...DEFAULT_SETTINGS.dashboard,
          ...(parsed.settings?.dashboard || {}),
        },
      },
    };
  } catch (error) {
    console.error('Failed to load application data:', error);
    return getCleanAppData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save application data:', error);
  }
}

export function exportAppDataJSON(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifeos-backup-${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedJSON(jsonString: string): AppData {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON format');
  }
  return {
    version: 1,
    hubs: Array.isArray(parsed.hubs) ? parsed.hubs : [],
    trackers: Array.isArray(parsed.trackers) ? parsed.trackers : [],
    trackerEntries: Array.isArray(parsed.trackerEntries) ? parsed.trackerEntries : [],
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings || {}),
      dashboard: {
        ...DEFAULT_SETTINGS.dashboard,
        ...(parsed.settings?.dashboard || {}),
      },
    },
  };
}

/**
 * Starter Blueprint Generator (Only invoked if user explicitly clicks "Generate Starter Hubs" in settings)
 */
export function getSampleTemplateData(): AppData {
  const today = getTodayDateString();
  const hub1Id = 'hub_fitness_sample';
  const hub2Id = 'hub_study_sample';
  const hub3Id = 'hub_projects_sample';

  const sampleHubs: Hub[] = [
    {
      id: hub1Id,
      name: 'Fitness & Health',
      description: 'Physical wellness, daily movement and recovery',
      icon: 'fitness',
      color: '#10B981',
      order: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: hub2Id,
      name: 'Learning & Mastery',
      description: 'Deep study, skill building, and reading',
      icon: 'book',
      color: '#6366F1',
      order: 1,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: hub3Id,
      name: 'Projects & Work',
      description: 'Creative builds, coding deliverables and milestone execution',
      icon: 'code',
      color: '#F59E0B',
      order: 2,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleTrackers: Tracker[] = [
    {
      id: 'trk_water',
      hubId: hub1Id,
      name: 'Hydration',
      description: 'Daily water intake',
      icon: 'water',
      type: 'counter',
      unit: 'glasses',
      target: 8,
      frequency: 'daily',
      startDate: today,
      color: '#0EA5E9',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trk_workout',
      hubId: hub1Id,
      name: 'Daily Workout',
      description: 'Physical training session completed',
      icon: 'fitness',
      type: 'boolean',
      target: 1,
      frequency: 'daily',
      startDate: today,
      color: '#10B981',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trk_study_hrs',
      hubId: hub2Id,
      name: 'Deep Study',
      description: 'Focused academic & concept study',
      icon: 'book',
      type: 'number',
      unit: 'hrs',
      target: 3,
      frequency: 'daily',
      startDate: today,
      color: '#6366F1',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trk_coding_time',
      hubId: hub3Id,
      name: 'Coding Duration',
      description: 'Time spent in IDE building features',
      icon: 'clock',
      type: 'duration',
      target: 120, // 2 hours
      frequency: 'daily',
      startDate: today,
      color: '#F59E0B',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleTasks: Task[] = [
    {
      id: 'tsk_1',
      hubId: hub2Id,
      title: 'Review chapter notes & practice problems',
      priority: 'high',
      status: 'todo',
      dueDate: today,
      tags: ['Study', 'Focus'],
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tsk_2',
      hubId: hub1Id,
      title: '30-minute afternoon mobility & stretching',
      priority: 'medium',
      status: 'todo',
      dueDate: today,
      tags: ['Health'],
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleGoals: Goal[] = [
    {
      id: 'goal_1',
      hubId: hub2Id,
      title: 'Complete Advanced Data Structures',
      description: 'Finish all 12 core lecture modules and labs',
      targetValue: 12,
      currentValue: 4,
      unit: 'modules',
      deadline: '',
      status: 'in_progress',
      color: '#6366F1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleNotes: Note[] = [
    {
      id: 'note_1',
      hubId: hub3Id,
      title: 'Architecture Rules & System Principles',
      content: '1. Modular component boundaries\n2. Real persistent state across reloads\n3. Zero clutter, highest intentionality.',
      tags: ['Systems', 'Philosophy'],
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    version: 1,
    hubs: sampleHubs,
    trackers: sampleTrackers,
    trackerEntries: [],
    tasks: sampleTasks,
    goals: sampleGoals,
    notes: sampleNotes,
    profile: { ...DEFAULT_PROFILE },
    settings: {
      ...DEFAULT_SETTINGS,
      dashboard: {
        ...DEFAULT_SETTINGS.dashboard,
        hubOrder: [hub1Id, hub2Id, hub3Id],
      },
    },
  };
}
