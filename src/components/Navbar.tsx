import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Laptop,
  Bell,
  CheckCircle2,
  Calendar,
  Settings,
  Sliders,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/date';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onOpenCreateHub?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    data,
    activeView,
    navigateTo,
    setIsSearchOpen,
    setIsCustomizeDashboardOpen,
    setTheme,
    currentTheme
  } = useApp();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Real actionable check-in items based on user's actual data
  const today = getTodayDateString();
  const pendingTasksToday = data.tasks.filter(t => t.dueDate === today && t.status !== 'completed');
  
  const loggedTrackerIdsToday = new Set(
    data.trackerEntries.filter(e => e.date === today).map(e => e.trackerId)
  );
  const unloggedTrackersToday = data.trackers.filter(t => !t.isArchived && !loggedTrackerIdsToday.has(t.id));

  const totalNotifications = pendingTasksToday.length + unloggedTrackersToday.length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FDFDFC]/90 dark:bg-[#0F1012]/90 backdrop-blur-md border-b border-[#E5E5E1] dark:border-[#22242B] px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Drawer Trigger + Brand Logo */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-full text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            aria-label="Open Navigation Menu"
          >
            <Layers className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 group text-left focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none rounded-lg p-1"
        >
          <div className="w-8 h-8 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded flex items-center justify-center font-bold text-sm shadow-2xs transition-transform group-hover:scale-105">
            <span>A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#1A1A1A] dark:text-white leading-none mb-0.5">
              AXIS
            </span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#666660] dark:text-[#A1A19D] leading-none">
              Operating System
            </span>
          </div>
        </button>
      </div>

      {/* Middle: Global Search Pill */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-full text-xs bg-[#F0F0EE] dark:bg-[#181A1F] text-[#666660] dark:text-[#A1A19D] border border-transparent hover:border-[#E5E5E1] dark:hover:border-[#282A32] focus:border-[#1A1A1A] transition-all focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
          aria-label="Open Global Search"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 opacity-60 text-[#666660] dark:text-[#A1A19D]" />
            <span className="font-normal">Search your system...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase bg-white dark:bg-[#101216] border border-[#E5E5E1] dark:border-[#282A32] rounded-full text-[#666660] dark:text-[#A1A19D] shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="sm:hidden p-2 rounded-full text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
          aria-label="Search Workspace"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Customize Dashboard Button */}
        {activeView === 'dashboard' && (
          <button
            onClick={() => setIsCustomizeDashboardOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] dark:text-white bg-[#F0F0EE] hover:bg-[#E5E5E1] dark:bg-[#181A1F] dark:hover:bg-[#22242B] rounded-full transition-colors border border-[#E5E5E1] dark:border-[#282A32] focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            aria-label="Customize Workspace"
          >
            <Sliders className="w-3.5 h-3.5 opacity-70" />
            <span>Customize</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-full text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            aria-label="Daily Notifications and Check-ins"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#FDFDFC] dark:ring-[#0F1012]" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-2xl p-4 shadow-xl z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E1] dark:border-[#282A32] mb-3">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white font-serif">
                  Daily Check-in
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#666660] dark:text-[#A1A19D]">
                  {totalNotifications} item{totalNotifications === 1 ? '' : 's'} today
                </span>
              </div>

              {totalNotifications === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white">
                    All caught up for today
                  </p>
                  <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] mt-0.5 font-serif italic">
                    No pending tasks or unlogged trackers.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingTasksToday.map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigateTo('tasks');
                      }}
                      className="p-2.5 rounded-xl bg-[#F9F9F7] dark:bg-[#121418] hover:bg-[#F0F0EE] dark:hover:bg-[#202229] border border-[#E5E5E1]/60 dark:border-[#282A32] cursor-pointer transition-colors text-left"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] dark:text-white">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </div>
                      <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] mt-0.5 block">
                        Task due today ({task.priority} priority)
                      </span>
                    </div>
                  ))}

                  {unloggedTrackersToday.map(trk => (
                    <div
                      key={trk.id}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigateTo('daily');
                      }}
                      className="p-2.5 rounded-xl bg-[#F9F9F7] dark:bg-[#121418] hover:bg-[#F0F0EE] dark:hover:bg-[#202229] border border-[#E5E5E1]/60 dark:border-[#282A32] cursor-pointer transition-colors text-left"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] dark:text-white">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A] dark:bg-white shrink-0" />
                        <span className="truncate">{trk.name}</span>
                      </div>
                      <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] mt-0.5 block">
                        Log today's {trk.type} entry
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Switcher Popover */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 rounded-full text-[#666660] dark:text-[#A1A19D] hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-colors flex items-center focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            aria-label="Theme Selector"
          >
            {data.settings.theme === 'system' ? (
              <Laptop className="w-4 h-4" />
            ) : currentTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-2xl p-1.5 shadow-xl z-50 animate-slide-up space-y-1">
              <button
                onClick={() => {
                  setTheme('light');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  data.settings.theme === 'light'
                    ? 'bg-[#F0F0EE] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white font-semibold'
                    : 'text-[#666660] dark:text-[#A1A19D] hover:bg-[#F9F9F7] dark:hover:bg-[#202228]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Light</span>
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  data.settings.theme === 'dark'
                    ? 'bg-[#F0F0EE] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white font-semibold'
                    : 'text-[#666660] dark:text-[#A1A19D] hover:bg-[#F9F9F7] dark:hover:bg-[#202228]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  data.settings.theme === 'system'
                    ? 'bg-[#F0F0EE] dark:bg-[#282A32] text-[#1A1A1A] dark:text-white font-semibold'
                    : 'text-[#666660] dark:text-[#A1A19D] hover:bg-[#F9F9F7] dark:hover:bg-[#202228]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile / Account Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-[#F0F0EE] dark:hover:bg-[#181A1F] transition-colors border border-transparent hover:border-[#E5E5E1] dark:hover:border-[#282A32] focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            aria-label="Workspace Options"
          >
            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] flex items-center justify-center text-xs font-bold font-serif">
              {data.profile.displayName ? data.profile.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#666660] dark:text-[#A1A19D] hidden sm:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] rounded-2xl p-2 shadow-xl z-50 animate-slide-up">
              <div className="px-3 py-2.5 border-b border-[#E5E5E1] dark:border-[#282A32] mb-1">
                <p className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                  {data.profile.displayName || 'AXIS Workspace'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] font-serif italic">Personal System</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigateTo('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-[#E5E5E1] hover:bg-[#F0F0EE] dark:hover:bg-[#22242B] rounded-xl transition-colors text-left"
              >
                <Settings className="w-3.5 h-3.5 opacity-60" />
                <span>Settings & Preferences</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsCustomizeDashboardOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1A1A1A] dark:text-[#E5E5E1] hover:bg-[#F0F0EE] dark:hover:bg-[#22242B] rounded-xl transition-colors text-left"
              >
                <Sliders className="w-3.5 h-3.5 opacity-60" />
                <span>Customize Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
