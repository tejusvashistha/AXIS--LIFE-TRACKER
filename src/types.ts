/**
 * Core Type Definitions for LifeOS
 * "Your life. Your system. Your rules."
 */

export type TrackerType = 
  | 'boolean'     // Yes / No (e.g. Workout completed)
  | 'number'      // Number (e.g. Study hours = 4)
  | 'counter'     // Counter with quick +/- (e.g. Water = 6 glasses)
  | 'duration'    // Duration in minutes / hours (e.g. Coding = 2h 30m)
  | 'percentage'  // Percentage 0-100% (e.g. Project = 70%)
  | 'amount';     // Amount with currency (e.g. Money saved = $500 / ₹500)

export type TrackerFrequency = 'daily' | 'weekly' | 'monthly';

export interface Tracker {
  id: string;
  hubId: string | null; // null if global/unassigned
  name: string;
  description?: string;
  icon: string; // Lucide icon identifier
  type: TrackerType;
  unit?: string; // e.g. "glasses", "hrs", "min", "pages", "$", "₹", "%"
  target?: number; // Target value per period
  frequency: TrackerFrequency;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  color: string; // Accent color hex or token
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerEntry {
  id: string;
  trackerId: string;
  date: string; // YYYY-MM-DD
  value: number; // For boolean: 1=yes, 0=no. For duration: stored in minutes. For amount/number/counter: actual value.
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  hubId: string | null;
  trackerId?: string | null; // Optional linked tracker
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';

export interface Goal {
  id: string;
  hubId: string | null;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. "%", "chapters", "km", "$"
  deadline?: string; // YYYY-MM-DD
  status: GoalStatus;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  hubId: string | null;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hub {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string; // Tailwind hex or palette
  coverImage?: string;
  order: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCustomization {
  showGreeting: boolean;
  showQuickStats: boolean;
  showHubs: boolean;
  showDailyFocus: boolean;
  showActiveGoals: boolean;
  showRecentNotes: boolean;
  hubViewMode: 'grid' | 'list' | 'compact';
  hubOrder: string[]; // List of Hub IDs
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  plan: 'free' | 'pro';
}

export interface UserSettings {
  theme: ThemeMode;
  currency: string; // e.g. "$", "₹", "€", "£", "¥"
  startOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  notificationsEnabled: boolean;
  soundEffects: boolean;
  dashboard: DashboardCustomization;
}

export interface AppData {
  version: number;
  hubs: Hub[];
  trackers: Tracker[];
  trackerEntries: TrackerEntry[];
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
  profile: UserProfile;
  settings: UserSettings;
}

export type ActiveView = 
  | 'dashboard'
  | 'hub-detail'
  | 'daily'
  | 'tasks'
  | 'trackers'
  | 'goals'
  | 'notes'
  | 'calendar'
  | 'settings';
