import React, { useState } from 'react';
import {
  X,
  Sliders,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  Palette,
  Check,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getIconComponent, AVAILABLE_ICONS, COLOR_PALETTES } from '../utils/icons';
import { Hub } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface CustomizeDashboardModalProps {
  onOpenCreateHub?: () => void;
  onEditHub?: (hub: Hub) => void;
}

export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({
  onOpenCreateHub,
  onEditHub,
}) => {
  const {
    data,
    isCustomizeDashboardOpen,
    setIsCustomizeDashboardOpen,
    updateSettings,
    reorderHubs,
    archiveHub,
    restoreHub,
    deleteHub,
    updateHub,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'hubs' | 'sections'>('hubs');
  const [dashboardConfig, setDashboardConfig] = useState(data.settings.dashboard);
  const [hubToDelete, setHubToDelete] = useState<Hub | null>(null);
  const [colorEditingHubId, setColorEditingHubId] = useState<string | null>(null);

  if (!isCustomizeDashboardOpen) return null;

  const allHubs = data.hubs;
  const activeHubs = data.hubs.filter(h => !h.isArchived);

  const handleToggleWidget = (key: keyof typeof dashboardConfig) => {
    if (typeof dashboardConfig[key] === 'boolean') {
      const updated = {
        ...dashboardConfig,
        [key]: !dashboardConfig[key],
      };
      setDashboardConfig(updated);
      updateSettings({ dashboard: updated });
      showToast('Dashboard sections updated', 'info');
    }
  };

  const handleMoveHub = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= allHubs.length) return;

    const reordered = [...allHubs];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    const orderedIds = reordered.map(h => h.id);
    reorderHubs(orderedIds);
    showToast('Hub reordered', 'success');
  };

  const handleToggleHubVisibility = (hub: Hub) => {
    if (hub.isArchived) {
      restoreHub(hub.id);
      showToast(`"${hub.name}" is now visible`, 'success');
    } else {
      archiveHub(hub.id);
      showToast(`"${hub.name}" is now hidden`, 'info');
    }
  };

  const handleUpdateHubColor = (hubId: string, color: string) => {
    updateHub(hubId, { color });
    setColorEditingHubId(null);
    showToast('Hub accent color updated', 'success');
  };

  const handleConfirmDelete = () => {
    if (!hubToDelete) return;
    const res = deleteHub(hubToDelete.id, true);
    setHubToDelete(null);
    showToast(`Hub "${res.deletedHub.name}" removed`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
        className="bg-white dark:bg-[#16181E] border border-[#E5E5E1] dark:border-[#282A32] rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E1] dark:border-[#282A32] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F0F0EE] dark:bg-[#202229] text-[#1A1A1A] dark:text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="customize-title" className="text-base font-bold text-[#1A1A1A] dark:text-white font-serif">
                Customize Dashboard
              </h2>
              <p className="text-xs text-[#666660] dark:text-[#A1A19D]">
                Reorder hubs, toggle visibility, and manage dashboard sections
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomizeDashboardOpen(false)}
            className="p-2 rounded-full text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white hover:bg-[#F0F0EE] dark:hover:bg-[#202229] transition-colors focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5E5E1] dark:border-[#282A32] pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('hubs')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'hubs'
                ? 'border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white'
                : 'border-transparent text-[#666660] dark:text-[#A1A19D] hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            Workspace Hubs ({allHubs.length})
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'sections'
                ? 'border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white'
                : 'border-transparent text-[#666660] dark:text-[#A1A19D] hover:text-[#1A1A1A] dark:hover:text-white'
            }`}
          >
            Dashboard Sections
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === 'hubs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D]">
                  Hub Hierarchy & Visibility
                </span>
                {onOpenCreateHub && (
                  <button
                    onClick={() => {
                      setIsCustomizeDashboardOpen(false);
                      onOpenCreateHub();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Hub</span>
                  </button>
                )}
              </div>

              {allHubs.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-[#F9F9F7] dark:bg-[#121418] border border-dashed border-[#E5E5E1] dark:border-[#282A32]">
                  <p className="text-xs font-medium text-[#1A1A1A] dark:text-white mb-1">
                    No hubs created yet.
                  </p>
                  <p className="text-[11px] text-[#666660] dark:text-[#A1A19D] mb-3">
                    Add your first life hub to begin customizing your layout.
                  </p>
                  {onOpenCreateHub && (
                    <button
                      onClick={() => {
                        setIsCustomizeDashboardOpen(false);
                        onOpenCreateHub();
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#1A1A1A] dark:bg-white dark:text-[#1A1A1A] rounded-full uppercase tracking-wider"
                    >
                      + Create Hub
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {allHubs.map((hub, index) => {
                    const HubIcon = getIconComponent(hub.icon);
                    const isColorEditing = colorEditingHubId === hub.id;

                    return (
                      <div
                        key={hub.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          hub.isArchived
                            ? 'bg-[#F9F9F7]/50 dark:bg-[#101216]/50 border-[#E5E5E1]/50 dark:border-[#282A32]/50 opacity-60'
                            : 'bg-[#F9F9F7] dark:bg-[#14161B] border-[#E5E5E1] dark:border-[#282A32]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Hub Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-2xs"
                              style={{ backgroundColor: hub.color }}
                            >
                              <HubIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">
                                  {hub.name}
                                </span>
                                {hub.isArchived && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#666660] dark:text-[#A1A19D] block truncate">
                                {hub.description || 'Workspace area'}
                              </span>
                            </div>
                          </div>

                          {/* Quick Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveHub(index, 'up')}
                              className="p-1.5 rounded-lg text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E5E5E1] dark:hover:bg-[#282A32] transition-colors"
                              title="Move Up"
                              aria-label={`Move ${hub.name} Up`}
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={index === allHubs.length - 1}
                              onClick={() => handleMoveHub(index, 'down')}
                              className="p-1.5 rounded-lg text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E5E5E1] dark:hover:bg-[#282A32] transition-colors"
                              title="Move Down"
                              aria-label={`Move ${hub.name} Down`}
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Accent Color Palette Trigger */}
                            <button
                              type="button"
                              onClick={() => setColorEditingHubId(isColorEditing ? null : hub.id)}
                              className="p-1.5 rounded-lg text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white hover:bg-[#E5E5E1] dark:hover:bg-[#282A32] transition-colors"
                              title="Change Accent Color"
                              aria-label={`Change ${hub.name} color`}
                            >
                              <Palette className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Hub Full Details */}
                            {onEditHub && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomizeDashboardOpen(false);
                                  onEditHub(hub);
                                }}
                                className="p-1.5 rounded-lg text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white hover:bg-[#E5E5E1] dark:hover:bg-[#282A32] transition-colors"
                                title="Edit Hub"
                                aria-label={`Edit ${hub.name}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Hide / Show Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleHubVisibility(hub)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                hub.isArchived
                                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                  : 'text-[#666660] hover:text-[#1A1A1A] dark:text-[#A1A19D] dark:hover:text-white hover:bg-[#E5E5E1] dark:hover:bg-[#282A32]'
                              }`}
                              title={hub.isArchived ? 'Show on Dashboard' : 'Hide from Dashboard'}
                              aria-label={hub.isArchived ? `Show ${hub.name}` : `Hide ${hub.name}`}
                            >
                              {hub.isArchived ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete Hub */}
                            <button
                              type="button"
                              onClick={() => setHubToDelete(hub)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Hub"
                              aria-label={`Delete ${hub.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Color Palette Picker */}
                        {isColorEditing && (
                          <div className="mt-3 pt-3 border-t border-[#E5E5E1] dark:border-[#282A32] animate-slide-up">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block mb-2">
                              Choose Accent Color
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {COLOR_PALETTES.map(c => (
                                <button
                                  key={c.hex}
                                  type="button"
                                  onClick={() => handleUpdateHubColor(hub.id, c.hex)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-2xs"
                                  style={{ backgroundColor: c.hex }}
                                  aria-label={`Select color ${c.name}`}
                                >
                                  {hub.color === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#666660] dark:text-[#A1A19D] block mb-2">
                Visible Dashboard Widgets
              </span>
              {[
                { key: 'showGreeting', label: 'Contextual Greeting Header', desc: 'Displays time-based greeting & current date' },
                { key: 'showHubs', label: 'Workspace Hubs Section', desc: 'Primary life areas grid and real progress' },
                { key: 'showDailyFocus', label: 'Daily Focus & Trackers', desc: 'Today’s tasks and quick habit loggers' },
                { key: 'showActiveGoals', label: 'Active Goals Progress', desc: 'Visual milestones & targets' },
                { key: 'showRecentNotes', label: 'Recent System Notes', desc: 'Quick access to latest notes and playbooks' },
              ].map(item => {
                const isEnabled = (dashboardConfig as any)[item.key];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9F9F7] dark:bg-[#14161B] border border-[#E5E5E1] dark:border-[#282A32]"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-white block">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-[#666660] dark:text-[#A1A19D] block font-serif italic mt-0.5">
                        {item.desc}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => handleToggleWidget(item.key as any)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none ${
                        isEnabled ? 'bg-[#1A1A1A] dark:bg-white' : 'bg-[#CCCCCC] dark:bg-[#33353E]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#16181E] shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E5E5E1] dark:border-[#282A32] flex justify-end shrink-0">
          <button
            onClick={() => setIsCustomizeDashboardOpen(false)}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-slate-200 rounded-full transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white outline-none"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!hubToDelete}
        title={`Delete "${hubToDelete?.name}" Hub?`}
        message="This will permanently delete this life hub along with all of its associated tasks, trackers, goals, and notes."
        warning="This action cannot be undone."
        confirmLabel="Delete Hub"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHubToDelete(null)}
      />
    </div>
  );
};
