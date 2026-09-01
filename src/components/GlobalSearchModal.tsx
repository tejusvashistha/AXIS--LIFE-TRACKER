import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Folder,
  CheckSquare,
  Activity,
  Target,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getIconComponent } from '../utils/icons';

export const GlobalSearchModal: React.FC = () => {
  const {
    data,
    isSearchOpen,
    setIsSearchOpen,
    navigateTo,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Map of hubs for quick name lookup
  const hubMap = useMemo(() => {
    const map = new Map<string, string>();
    data.hubs.forEach(h => map.set(h.id, h.name));
    return map;
  }, [data.hubs]);

  // Search results calculation
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: {
      id: string;
      title: string;
      subtitle?: string;
      category: 'Hub' | 'Task' | 'Tracker' | 'Goal' | 'Note';
      icon: React.ElementType;
      color?: string;
      action: () => void;
    }[] = [];

    // Search Hubs
    data.hubs.forEach(hub => {
      if (hub.name.toLowerCase().includes(q) || hub.description?.toLowerCase().includes(q)) {
        const IconComp = getIconComponent(hub.icon);
        results.push({
          id: hub.id,
          title: hub.name,
          subtitle: hub.description || 'Custom Life Hub',
          category: 'Hub',
          icon: IconComp,
          color: hub.color,
          action: () => navigateTo('hub-detail', hub.id),
        });
      }
    });

    // Search Tasks
    data.tasks.forEach(task => {
      if (
        task.title.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.tags.some(t => t.toLowerCase().includes(q))
      ) {
        const hubName = task.hubId ? hubMap.get(task.hubId) : 'Inbox';
        results.push({
          id: task.id,
          title: task.title,
          subtitle: `${hubName} • Priority: ${task.priority} • Status: ${task.status}`,
          category: 'Task',
          icon: CheckSquare,
          action: () => navigateTo('tasks'),
        });
      }
    });

    // Search Trackers
    data.trackers.forEach(trk => {
      if (trk.name.toLowerCase().includes(q) || trk.description?.toLowerCase().includes(q)) {
        const IconComp = getIconComponent(trk.icon);
        const hubName = trk.hubId ? hubMap.get(trk.hubId) : 'Global';
        results.push({
          id: trk.id,
          title: trk.name,
          subtitle: `${hubName} • Type: ${trk.type}`,
          category: 'Tracker',
          icon: IconComp,
          color: trk.color,
          action: () => navigateTo('trackers'),
        });
      }
    });

    // Search Goals
    data.goals.forEach(goal => {
      if (goal.title.toLowerCase().includes(q) || goal.description?.toLowerCase().includes(q)) {
        const hubName = goal.hubId ? hubMap.get(goal.hubId) : 'Global';
        results.push({
          id: goal.id,
          title: goal.title,
          subtitle: `${hubName} • Progress: ${goal.currentValue}/${goal.targetValue} ${goal.unit}`,
          category: 'Goal',
          icon: Target,
          color: goal.color,
          action: () => navigateTo('goals'),
        });
      }
    });

    // Search Notes
    data.notes.forEach(note => {
      if (
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.tags.some(t => t.toLowerCase().includes(q))
      ) {
        const hubName = note.hubId ? hubMap.get(note.hubId) : 'General';
        results.push({
          id: note.id,
          title: note.title,
          subtitle: `${hubName} • ${note.content.slice(0, 40)}...`,
          category: 'Note',
          icon: FileText,
          action: () => navigateTo('notes'),
        });
      }
    });

    return results;
  }, [query, data, hubMap, navigateTo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      e.preventDefault();
      searchResults[selectedIndex].action();
      setIsSearchOpen(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search hubs, tasks, trackers, goals, notes..."
            className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center">
              <p className="text-xs font-medium text-slate-500">
                Type anything to search your personal workspace
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
                <span>Hubs</span>
                <span>•</span>
                <span>Tasks</span>
                <span>•</span>
                <span>Trackers</span>
                <span>•</span>
                <span>Goals</span>
                <span>•</span>
                <span>Notes</span>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No matching results found
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                No items match "{query}" in your workspace.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((result, idx) => {
                const IconComponent = result.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={`${result.category}-${result.id}`}
                    onClick={() => {
                      result.action();
                      setIsSearchOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs"
                        style={{ backgroundColor: result.color || '#6366F1' }}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-display truncate">
                            {result.title}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">
                            {result.category}
                          </span>
                        </div>
                        {result.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 px-4 bg-slate-50 dark:bg-[#12141A] border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Press <kbd className="font-mono">Enter</kbd> to jump</span>
        </div>
      </div>
    </div>
  );
};
