import React, { useState, useMemo } from 'react';
import {
  Plus,
  FileText,
  Pin,
  Tag,
  Trash2,
  Edit2,
  Search,
  Calendar
} from 'lucide-react';
import { Note } from '../types';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/date';
import { ConfirmDialog } from './ConfirmDialog';

interface NotesViewProps {
  onOpenCreateNote: () => void;
  onEditNote: (note: Note) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  onOpenCreateNote,
  onEditNote,
}) => {
  const {
    data,
    updateNote,
    deleteNote,
  } = useApp();

  const [selectedHubId, setSelectedHubId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const activeHubs = data.hubs.filter(h => !h.isArchived);
  const hubMap = useMemo(() => new Map(data.hubs.map(h => [h.id, h])), [data.hubs]);

  const filteredNotes = useMemo(() => {
    return data.notes.filter(note => {
      if (selectedHubId !== 'all' && note.hubId !== selectedHubId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.title.toLowerCase().includes(q);
        const matchContent = note.content.toLowerCase().includes(q);
        const matchTags = note.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTags) return false;
      }
      return true;
    });
  }, [data.notes, selectedHubId, searchQuery]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Notes & Systems
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Capture rules, principles, references, and personal system playbooks
          </p>
        </div>

        <button
          onClick={onOpenCreateNote}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#16181E] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes content or tags..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedHubId}
            onChange={e => setSelectedHubId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Hubs</option>
            {activeHubs.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#16181E] border border-dashed border-slate-200 dark:border-slate-800 shadow-xs">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            No notes found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            {searchQuery || selectedHubId !== 'all'
              ? 'No notes match the selected filters.'
              : 'Write down your system guidelines, ideas, or personal wiki.'}
          </p>
          <button
            onClick={onOpenCreateNote}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-900 dark:text-white font-display">
                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Pinned Notes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map(note => {
                  const hub = note.hubId ? hubMap.get(note.hubId) : null;
                  return (
                    <div
                      key={note.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#16181E] border border-amber-200/80 dark:border-amber-900/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display truncate pr-2">
                            {note.title}
                          </h3>
                          <button
                            onClick={() => updateNote(note.id, { isPinned: false })}
                            className="p-1 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="Unpin note"
                          >
                            <Pin className="w-3.5 h-3.5 fill-amber-500" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-6 leading-relaxed mb-3">
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          {hub && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.2 rounded text-white"
                              style={{ backgroundColor: hub.color }}
                            >
                              {hub.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {formatDate(note.updatedAt.split('T')[0])}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditNote(note)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title="Edit Note"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setNoteToDelete(note)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Other Notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-bold text-slate-900 dark:text-white font-display mb-3">
                  All Notes
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map(note => {
                  const hub = note.hubId ? hubMap.get(note.hubId) : null;
                  return (
                    <div
                      key={note.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#16181E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display truncate pr-2">
                            {note.title}
                          </h3>
                          <button
                            onClick={() => updateNote(note.id, { isPinned: true })}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Pin note to top"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-6 leading-relaxed mb-3">
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          {hub && (
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.2 rounded text-white"
                              style={{ backgroundColor: hub.color }}
                            >
                              {hub.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {formatDate(note.updatedAt.split('T')[0])}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditNote(note)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title="Edit Note"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setNoteToDelete(note)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Note Confirmation */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        title={`Delete "${noteToDelete?.title}"?`}
        message="Are you sure you want to permanently delete this note?"
        confirmLabel="Delete Note"
        isDestructive={true}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};
