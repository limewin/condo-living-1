import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Pin,
  CheckCircle2,
  Ruler,
  Building,
  Users,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import { MoveInNote, NoteCategory } from '../types';

interface NotesViewProps {
  notes: MoveInNote[];
  onAddNote: (note: Omit<MoveInNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  onUpdateNote: (noteId: string, updates: Partial<MoveInNote>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<MoveInNote | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { key: NoteCategory; label: string; icon: React.ElementType }[] = [
    { key: 'condo_rules', label: 'Admin & Rules', icon: Building },
    { key: 'measurements', label: 'Measurements', icon: Ruler },
    { key: 'roommates', label: 'Roommates', icon: Users },
    { key: 'checklist', label: 'Checklist', icon: CheckSquare },
    { key: 'shopping', label: 'Shopping', icon: FileText },
    { key: 'general', label: 'General', icon: FileText },
  ];

  const filteredNotes = notes
    .filter((n) => selectedCat === 'all' || n.category === selectedCat)
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleOpenAdd = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setIsPinned(false);
    setChecklistItems([]);
    setEditingNote(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (note: MoveInNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setIsPinned(!!note.isPinned);
    setChecklistItems(note.checklist || []);
    setShowAddModal(true);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      { id: Date.now().toString(), text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleToggleCheckItem = async (note: MoveInNote, itemId: string) => {
    const updatedChecklist = (note.checklist || []).map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    await onUpdateNote(note.id, { checklist: updatedChecklist });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await onUpdateNote(editingNote.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          isPinned,
          checklist: checklistItems.length > 0 ? checklistItems : undefined,
        });
      } else {
        await onAddNote({
          title: title.trim(),
          content: content.trim(),
          category,
          isPinned,
          checklist: checklistItems.length > 0 ? checklistItems : undefined,
        });
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Knowledge Base
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
            Notes, Rules & Measurements
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Record condo admin move-in guidelines, elevator reservations, and room dimensions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-2xl text-xs shadow-xs border border-[#BADB88] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors border font-medium ${
            selectedCat === 'all'
              ? 'bg-[#22252A] text-white border-[#22252A]'
              : 'bg-white text-[#4A505B] border-[#E8E4D3]'
          }`}
        >
          All Notes ({notes.length})
        </button>
        {categories.map((c) => {
          const count = notes.filter((n) => n.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors border font-medium flex items-center gap-1.5 ${
                selectedCat === c.key
                  ? 'bg-[#D7E9B9] text-[#22252A] border-[#BADB88] font-bold'
                  : 'bg-white text-[#4A505B] border-[#E8E4D3]'
              }`}
            >
              <span>{c.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E4D3]">
          <FileText className="w-12 h-12 text-[#8EAE56] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#22252A]">No notes created yet</p>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">
            Store cabinet sizes, condo gate pass procedures, or roommate agreements.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-[#D7E9B9] text-[#22252A] font-semibold px-4 py-2 rounded-xl text-xs border border-[#BADB88]"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            return (
              <div
                key={note.id}
                className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs flex flex-col justify-between hover:border-[#D7E9B9] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#556B2F] bg-[#EBF4D3] px-2 py-0.5 rounded-md">
                        {note.category.replace('_', ' ')}
                      </span>
                      {note.isPinned && (
                        <Pin className="w-3 h-3 text-[#556B2F] fill-[#556B2F]" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1 text-gray-400 hover:text-[#22252A] rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete note?')) onDeleteNote(note.id);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#22252A] font-['Outfit'] mb-2">
                    {note.title}
                  </h3>

                  {note.content && (
                    <p className="text-xs text-[#4A505B] whitespace-pre-line leading-relaxed mb-3">
                      {note.content}
                    </p>
                  )}

                  {/* Checklist if present */}
                  {note.checklist && note.checklist.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#E8E4D3]/60">
                      {note.checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleCheckItem(note, item.id)}
                          className="flex items-center gap-2 text-xs text-[#2D3139] cursor-pointer hover:opacity-80"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4 text-[#556B2F] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <span className={item.completed ? 'line-through text-gray-400' : ''}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E4D3]/50 text-[10px] text-[#8A909D]">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#FEFBE9] rounded-3xl p-6 shadow-2xl border border-[#E8E4D3] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D3]">
              <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Move-in Permit Requirements, Bed Dimensions"
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3139] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoteCategory)}
                    className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
                  >
                    <option value="condo_rules">Admin & Condo Rules</option>
                    <option value="measurements">Measurements & Sizes</option>
                    <option value="roommates">Roommates</option>
                    <option value="checklist">Checklist</option>
                    <option value="shopping">Shopping Notes</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#2D3139]">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#556B2F]"
                    />
                    <span>Pin note to top</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Details & Text</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter details, rules, elevator reservation contact number..."
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl p-3 text-[#22252A] focus:outline-hidden"
                />
              </div>

              {/* Checklist builder */}
              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Interactive Checklist Items (Optional)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="e.g. Submit notarized lease agreement"
                    className="flex-1 bg-white border border-[#E8E4D3] rounded-xl px-3 py-1.5 text-[#22252A] focus:outline-hidden"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="bg-white hover:bg-[#D7E9B9] px-3 py-1.5 rounded-xl border border-[#E8E4D3] font-semibold text-[#22252A]"
                  >
                    Add
                  </button>
                </div>

                {checklistItems.length > 0 && (
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#E8E4D3] max-h-32 overflow-y-auto">
                    {checklistItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                        <span>• {item.text}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setChecklistItems(checklistItems.filter((_, i) => i !== idx))
                          }
                          className="text-gray-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E4D3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-xl border border-[#BADB88]"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
