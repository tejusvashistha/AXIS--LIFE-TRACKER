import React from 'react';
import {
  LayoutDashboard,
  SunMedium,
  CheckSquare,
  Activity,
  Target,
  FileText,
  CalendarDays,
  Settings,
  Plus,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getIconComponent } from '../utils/icons';
import { ActiveView } from '../types';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenCreateHub: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  onOpenCreateHub,
}) => {
  const {
    data,
    activeView,
    selectedHubId,
    navigateTo,
    setIsCustomizeDashboardOpen,
  } = useApp();

  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const pendingTasksCount = data.tasks.filter(t => t.status !== 'completed').length;
  const activeGoalsCount = data.goals.filter(g => g.status === 'in_progress').length;

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily View', icon: SunMedium },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'trackers', label: 'Trackers', icon: Activity },
    { id: 'goals', label: 'Goals', icon: Target, badge: activeGoalsCount > 0 ? activeGoalsCount : undefined },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: ActiveView, hubId?: string | null) => {
    navigateTo(view, hubId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4 bg-[#F9F9F7] dark:bg-[#121418] text-[#1A1A1A] dark:text-[#F3F3F1]">
      {/* Primary Navigation List */}
      <nav className="space-y-1" aria-label="Main Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id && !selectedHubId;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none ${
                isActive
                  ? 'bg-white dark:bg-[#1C1E25] border border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white font-semibold shadow-2xs'
                  : 'text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] hover:text-[#1A1A1A] dark:hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'opacity-90 text-[#1A1A1A] dark:text-white' : 'opacity-50'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#F0F0EE] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white'
                      : 'bg-[#EAEAE6] dark:bg-[#202228] text-[#666660] dark:text-[#A1A19D]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Custom Hubs Section */}
      <div className="mt-6 flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
            My Hubs ({activeHubs.length})
          </span>
          <button
            onClick={() => {
              onOpenCreateHub();
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-1 rounded-md text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            title="Create New Hub"
            aria-label="Create New Hub"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeHubs.length === 0 ? (
          <div className="px-3 py-4 text-center rounded-xl border border-dashed border-[#E5E5E1] dark:border-[#282A32] bg-white/60 dark:bg-[#181A1F]/40">
            <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] font-serif italic">
              No hubs created yet
            </p>
            <button
              onClick={() => {
                onOpenCreateHub();
                if (onCloseMobile) onCloseMobile();
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-[#1A1A1A] dark:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            >
              <Plus className="w-3 h-3" />
              <span>Create Hub</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {activeHubs.map(hub => {
              const HubIcon = getIconComponent(hub.icon);
              const isSelected = activeView === 'hub-detail' && selectedHubId === hub.id;
              const hubTasks = data.tasks.filter(t => t.hubId === hub.id && t.status !== 'completed').length;

              return (
                <button
                  key={hub.id}
                  onClick={() => handleNavClick('hub-detail', hub.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none ${
                    isSelected
                      ? 'bg-white dark:bg-[#1C1E25] border border-[#E5E5E1] dark:border-[#282A32] text-[#1A1A1A] dark:text-white font-semibold shadow-2xs'
                      : 'text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] hover:text-[#1A1A1A] dark:hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 text-[10px]"
                      style={{ backgroundColor: hub.color }}
                    >
                      <HubIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="truncate">{hub.name}</span>
                  </div>

                  {hubTasks > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#F0F0EE] dark:bg-[#282A32] text-[#666660] dark:text-[#A1A19D]">
                      {hubTasks}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Customize Action Card */}
      <div className="mt-4 p-3.5 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666660] dark:text-[#A1A19D]">
            Workspace
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <p className="text-xs text-[#1A1A1A] dark:text-[#F3F3F1] font-medium">
          {activeHubs.length} Active Hub{activeHubs.length === 1 ? '' : 's'} · {data.tasks.length} Total Task{data.tasks.length === 1 ? '' : 's'}
        </p>
        <button
          onClick={() => {
            setIsCustomizeDashboardOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2 bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#202229] dark:hover:bg-[#282A32] text-[#1A1A1A] dark:text-white text-[10px] font-bold tracking-wider uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
        >
          <Sliders className="w-3 h-3 opacity-70" />
          <span>Customize Layout</span>
        </button>
      </div>

      {/* Bottom Philosophy Footer */}
      <div className="mt-4 pt-3 border-t border-[#E5E5E1] dark:border-[#282A32]">
        <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] font-serif italic text-center">
          "Your life. Your system. Your rules."
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 bg-[#F9F9F7] dark:bg-[#121418] border-r border-[#E5E5E1] dark:border-[#22242B] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-[#F9F9F7] dark:bg-[#121418] border-r border-[#E5E5E1] dark:border-[#22242B] shadow-2xl z-10 animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
