import React from 'react';
import {
  Folder,
  BookOpen,
  Dumbbell,
  Wallet,
  Briefcase,
  Code2,
  GraduationCap,
  Sparkles,
  Plane,
  FileText,
  User,
  Heart,
  Target,
  CheckSquare,
  Activity,
  Flame,
  Droplets,
  Clock,
  Percent,
  Coins,
  Smile,
  Compass,
  Palette,
  Music,
  Coffee,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Layers,
  Zap,
  Bookmark,
  TrendingUp,
  Award,
  Shield,
  Star,
  Globe,
  MapPin,
  Calendar,
  BarChart3,
  Lightbulb,
  Camera,
  Feather,
  Tv,
  Utensils,
  Leaf,
  Brain,
  Timer,
  LucideIcon
} from 'lucide-react';

export const AVAILABLE_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  folder: { label: 'Folder', icon: Folder },
  book: { label: 'Study / Book', icon: BookOpen },
  fitness: { label: 'Fitness / Dumbbell', icon: Dumbbell },
  finance: { label: 'Money / Wallet', icon: Wallet },
  business: { label: 'Business / Briefcase', icon: Briefcase },
  code: { label: 'Coding', icon: Code2 },
  graduation: { label: 'Education / College', icon: GraduationCap },
  sparkles: { label: 'Projects / Sparks', icon: Sparkles },
  travel: { label: 'Travel / Plane', icon: Plane },
  notes: { label: 'Notes / Writing', icon: FileText },
  personal: { label: 'Personal / Identity', icon: User },
  heart: { label: 'Health / Heart', icon: Heart },
  target: { label: 'Target / Goal', icon: Target },
  check: { label: 'Tasks / Checklist', icon: CheckSquare },
  activity: { label: 'Activity / Pulse', icon: Activity },
  flame: { label: 'Streak / Energy', icon: Flame },
  water: { label: 'Water / Hydration', icon: Droplets },
  clock: { label: 'Time / Duration', icon: Clock },
  percent: { label: 'Percentage', icon: Percent },
  coins: { label: 'Savings / Money', icon: Coins },
  coffee: { label: 'Morning / Routine', icon: Coffee },
  sun: { label: 'Day / Sunshine', icon: Sun },
  moon: { label: 'Sleep / Rest', icon: Moon },
  laptop: { label: 'Tech / Work', icon: Laptop },
  cpu: { label: 'Deep Work / Logic', icon: Cpu },
  layers: { label: 'Systems / Organization', icon: Layers },
  zap: { label: 'Productivity / Quick', icon: Zap },
  bookmark: { label: 'Reading / Bookmark', icon: Bookmark },
  trend: { label: 'Growth / Progress', icon: TrendingUp },
  award: { label: 'Achievement', icon: Award },
  star: { label: 'Priority / Star', icon: Star },
  globe: { label: 'World / Global', icon: Globe },
  calendar: { label: 'Calendar / Schedule', icon: Calendar },
  chart: { label: 'Analytics / Metrics', icon: BarChart3 },
  idea: { label: 'Idea / Innovation', icon: Lightbulb },
  palette: { label: 'Design / Creative', icon: Palette },
  music: { label: 'Audio / Focus', icon: Music },
  food: { label: 'Nutrition / Meal', icon: Utensils },
  leaf: { label: 'Mindfulness / Nature', icon: Leaf },
  brain: { label: 'Mental / Knowledge', icon: Brain },
  timer: { label: 'Timer / Stopwatch', icon: Timer },
};

export const COLOR_PALETTES = [
  { name: 'Indigo', hex: '#6366F1', bgLight: 'bg-indigo-50', textLight: 'text-indigo-600', borderLight: 'border-indigo-200', bgDark: 'dark:bg-indigo-950/40', textDark: 'dark:text-indigo-400', borderDark: 'dark:border-indigo-800' },
  { name: 'Emerald', hex: '#10B981', bgLight: 'bg-emerald-50', textLight: 'text-emerald-600', borderLight: 'border-emerald-200', bgDark: 'dark:bg-emerald-950/40', textDark: 'dark:text-emerald-400', borderDark: 'dark:border-emerald-800' },
  { name: 'Amber', hex: '#F59E0B', bgLight: 'bg-amber-50', textLight: 'text-amber-600', borderLight: 'border-amber-200', bgDark: 'dark:bg-amber-950/40', textDark: 'dark:text-amber-400', borderDark: 'dark:border-amber-800' },
  { name: 'Sky', hex: '#0EA5E9', bgLight: 'bg-sky-50', textLight: 'text-sky-600', borderLight: 'border-sky-200', bgDark: 'dark:bg-sky-950/40', textDark: 'dark:text-sky-400', borderDark: 'dark:border-sky-800' },
  { name: 'Rose', hex: '#F43F5E', bgLight: 'bg-rose-50', textLight: 'text-rose-600', borderLight: 'border-rose-200', bgDark: 'dark:bg-rose-950/40', textDark: 'dark:text-rose-400', borderDark: 'dark:border-rose-800' },
  { name: 'Purple', hex: '#8B5CF6', bgLight: 'bg-purple-50', textLight: 'text-purple-600', borderLight: 'border-purple-200', bgDark: 'dark:bg-purple-950/40', textDark: 'dark:text-purple-400', borderDark: 'dark:border-purple-800' },
  { name: 'Teal', hex: '#14B8A6', bgLight: 'bg-teal-50', textLight: 'text-teal-600', borderLight: 'border-teal-200', bgDark: 'dark:bg-teal-950/40', textDark: 'dark:text-teal-400', borderDark: 'dark:border-teal-800' },
  { name: 'Orange', hex: '#F97316', bgLight: 'bg-orange-50', textLight: 'text-orange-600', borderLight: 'border-orange-200', bgDark: 'dark:bg-orange-950/40', textDark: 'dark:text-orange-400', borderDark: 'dark:border-orange-800' },
  { name: 'Slate', hex: '#64748B', bgLight: 'bg-slate-100', textLight: 'text-slate-700', borderLight: 'border-slate-300', bgDark: 'dark:bg-slate-800', textDark: 'dark:text-slate-300', borderDark: 'dark:border-slate-700' },
];

export function getIconComponent(iconName: string | undefined): LucideIcon {
  if (!iconName || !AVAILABLE_ICONS[iconName]) {
    return Folder;
  }
  return AVAILABLE_ICONS[iconName].icon;
}

export function getColorPalette(colorHexOrName?: string) {
  if (!colorHexOrName) return COLOR_PALETTES[0];
  const found = COLOR_PALETTES.find(
    p => p.hex.toLowerCase() === colorHexOrName.toLowerCase() || p.name.toLowerCase() === colorHexOrName.toLowerCase()
  );
  return found || COLOR_PALETTES[0];
}
