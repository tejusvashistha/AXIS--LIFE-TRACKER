import React, { useState, useEffect } from 'react';
import { X, Pin, Tag } from 'lucide-react';
import { Note } from '../types';
import { useApp } from '../context/AppContext';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingNote?: Note | null;
  defaultHubId?: string | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNote,
  defaultHubId,
}) => {
  const { data } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hubId, setHubId] = useState<string | null>(defaultHubId || null);
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setHubId(editingNote.hubId);
      setIsPinned(editingNote.isPinned);
      setTags(editingNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setHubId(defaultHubId || null);
      setIsPinned(false);
      setTags([]);
    }
    setError('');
    setTagInput('');
  }, [editingNote, isOpen, defaultHubId]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      setError('Please provide a title or note content');
      return;
    }

    onSave({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      hubId: hubId || null,
      isPinned,
      tags,
    });
    onClose();
  };

  const activeHubs = data.hubs.filter(h => !h.isArchived);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#16181E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {editingNote ? 'Edit Note' : 'Create Note'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Capture thoughts, architecture decisions, and references
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                isPinned
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. System Rules, Architecture Draft, Book Summary..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold placeholder:font-normal placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Hub Association */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associated Hub
            </label>
            <select
              value={hubId || ''}
              onChange={e => setHubId(e.target.value || null)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">No Hub (General Notes)</option>
              {activeHubs.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note Content
            </label>
            <textarea
              value={content}
              onChange={e => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              placeholder="Write your note, Markdown, or action items here..."
              rows={8}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono leading-relaxed placeholder:font-sans placeholder:text-slate-400 resize-none"
            />
            {error && <p className="text-rose-500 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Add..."
                className="flex-1 px-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1A1D24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              >
                Add Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-xs"
            >
              {editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
