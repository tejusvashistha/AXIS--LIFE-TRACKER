import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Download,
  Upload,
  AlertTriangle,
  Check,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from './ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    data,
    setTheme,
    updateSettings,
    clearAllData,
    loadSampleData,
    exportData,
    importData,
    showToast,
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSampleConfirm, setShowSampleConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importedJsonDraft, setImportedJsonDraft] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { theme } = data.settings;

  // Compute actual counts without fake stats
  const activeHubsCount = data.hubs.filter(h => !h.isArchived).length;
  const tasksCount = data.tasks.length;
  const completedTasksCount = data.tasks.filter(t => t.status === 'completed').length;
  const trackersCount = data.trackers.length;
  const goalsCount = data.goals.length;
  const notesCount = data.notes.length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setImportedJsonDraft(text);
      setShowImportConfirm(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to read import file', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (importedJsonDraft) {
      importData(importedJsonDraft);
      setShowImportConfirm(false);
      setImportedJsonDraft(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#E5E5E1] dark:border-[#282A32]">
        <h1 className="text-3xl sm:text-4xl font-light italic font-serif text-[#1A1A1A] dark:text-white tracking-tight">
          System Settings & Data
        </h1>
        <p className="text-sm text-[#666660] dark:text-[#A1A19D] mt-1 font-serif">
          Manage your personal workspace preferences, theme, and data backups
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
            Appearance & Visual Theme
          </h2>
          <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic mt-1">
            Choose how your life operating system renders across devices
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'system', label: 'System', icon: Laptop, desc: 'Match OS setting' },
            { id: 'light', label: 'Light', icon: Sun, desc: 'Editorial bright look' },
            { id: 'dark', label: 'Dark', icon: Moon, desc: 'Editorial dark canvas' },
          ].map(opt => {
            const IconComp = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none ${
                  isSelected
                    ? 'border-[#1A1A1A] dark:border-white bg-[#F9F9F7] dark:bg-[#14161B] text-[#1A1A1A] dark:text-white shadow-2xs'
                    : 'border-[#E5E5E1] dark:border-[#282A32] bg-white dark:bg-[#181A1F] text-[#666660] dark:text-[#A1A19D] hover:border-[#CCCCCC] dark:hover:border-[#444]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#1A1A1A] dark:text-white' : 'text-[#666660] dark:text-[#A1A19D]'}`} />
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-white stroke-[3]" />}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {opt.label}
                </span>
                <span className="text-[11px] font-serif italic text-[#666660] dark:text-[#A1A19D] block mt-0.5">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Workspace Diagnostics & Real Statistics */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
            Workspace Summary
          </h2>
          <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic mt-1">
            Real metrics calculated strictly from your active personal items
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block">Hubs</span>
            <span className="text-base font-bold text-[#1A1A1A] dark:text-white font-mono mt-1 block">{activeHubsCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block">Tasks</span>
            <span className="text-base font-bold text-[#1A1A1A] dark:text-white font-mono mt-1 block">{tasksCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block">Done</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">{completedTasksCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block">Trackers</span>
            <span className="text-base font-bold text-[#1A1A1A] dark:text-white font-mono mt-1 block">{trackersCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block">Goals</span>
            <span className="text-base font-bold text-[#1A1A1A] dark:text-white font-mono mt-1 block">{goalsCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block">Notes</span>
            <span className="text-base font-bold text-[#1A1A1A] dark:text-white font-mono mt-1 block">{notesCount}</span>
          </div>
        </div>
      </section>

      {/* 3. Data Backup, Export & Restore */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] dark:text-white">
            Data Portability & Backups
          </h2>
          <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic mt-1">
            Your data is 100% yours. Export at any time as standard JSON or import an existing backup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                  Export Workspace Backup
                </span>
              </div>
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic mb-4 leading-relaxed">
                Downloads a clean JSON file with all hubs, tasks, tracker logs, goals, and notes.
              </p>
            </div>
            <button
              onClick={exportData}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-slate-200 rounded-full transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            >
              Export JSON File
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                  Import Backup
                </span>
              </div>
              <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic mb-4 leading-relaxed">
                Restore your workspace from an existing exported JSON file.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-white dark:bg-[#181A1F] hover:bg-[#F0F0EE] dark:hover:bg-[#202229] border border-[#E5E5E1] dark:border-[#282A32] rounded-full transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            >
              Select Backup File
            </button>
          </div>
        </div>
      </section>

      {/* 4. Optional Starter Blueprint Generator */}
      <section className="p-6 rounded-3xl bg-[#F0F0EE] dark:bg-[#181A1F] border border-[#E5E5E1] dark:border-[#282A32] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1A1A1A] dark:text-white mb-1">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">
              Load Starter Blueprint Template
            </h2>
          </div>
          <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic">
            Want inspiration? Populate clean sample Fitness, Study, and Work hubs.
          </p>
        </div>

        <button
          onClick={() => setShowSampleConfirm(true)}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white bg-white dark:bg-[#22242B] hover:bg-[#F9F9F7] dark:hover:bg-[#282A32] border border-[#E5E5E1] dark:border-[#282A32] rounded-full transition-all shrink-0 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
        >
          Load Starter Blueprint
        </button>
      </section>

      {/* 5. Danger Zone: Reset Workspace */}
      <section className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">
              Reset Workspace
            </h2>
          </div>
          <p className="text-xs text-[#666660] dark:text-[#A1A19D] font-serif italic">
            Erase all hubs, tasks, trackers, goals, and notes to return to a clean slate.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-white bg-white hover:bg-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-800 rounded-full transition-all shrink-0 shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
        >
          Reset All Data
        </button>
      </section>

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset entire workspace?"
        message="This action will permanently delete all your hubs, tasks, tracker logs, goals, and notes. This cannot be undone."
        confirmLabel="Yes, Reset Everything"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Sample Data Confirmation */}
      <ConfirmDialog
        isOpen={showSampleConfirm}
        title="Load starter blueprint?"
        message="This will load sample Fitness, Study, and Coding hubs into your workspace."
        confirmLabel="Load Starter Template"
        isDestructive={false}
        onConfirm={() => {
          loadSampleData();
          setShowSampleConfirm(false);
        }}
        onCancel={() => setShowSampleConfirm(false)}
      />

      {/* Import Confirmation */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        title="Replace current workspace with imported data?"
        message="Importing this file will overwrite your current workspace with the data from the backup file."
        confirmLabel="Import & Replace"
        isDestructive={false}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirm(false);
          setImportedJsonDraft(null);
        }}
      />
    </div>
  );
};
