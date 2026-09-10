import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowRight,
  Package,
  DollarSign,
  Trash2,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { MoveInItem, ItemCategory } from '../types';
import { formatPHP } from '../utils/currency';

interface CategoriesViewProps {
  categories: ItemCategory[];
  items: MoveInItem[];
  onSelectCategory: (categoryName: string) => void;
  onAddCategory: (category: Omit<ItemCategory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  onUpdateCategory: (categoryId: string, updates: Partial<ItemCategory>) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  items,
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeItems = items.filter((i) => i.status !== 'no_longer_needed');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddCategory({
        name: newCatName.trim(),
        isCustom: true,
      });
      setNewCatName('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
      });
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: ItemCategory) => {
    const itemsInCat = items.filter((i) => i.category === cat.name);
    if (itemsInCat.length > 0) {
      alert(`Cannot delete "${cat.name}" because it contains ${itemsInCat.length} items. Please reassign or delete those items first.`);
      return;
    }
    if (window.confirm(`Delete category "${cat.name}"?`)) {
      await onDeleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Spatial Organization
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
            Condo Room & Need Categories
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Break down your move into manageable zones: Sleeping, Bathroom, Organization & Kitchen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-2xl text-xs shadow-xs border border-[#BADB88] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catItems = activeItems.filter((i) => i.category === cat.name);
          const totalCost = catItems.reduce((sum, i) => sum + i.totalPrice, 0);
          const purchasedCount = catItems.filter(
            (i) => i.status === 'purchased' || i.status === 'already_owned'
          ).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs flex flex-col justify-between hover:border-[#D7E9B9] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-[#6B7280]">
                        {purchasedCount}/{catItems.length} acquired
                      </span>
                    </div>
                  </div>

                  {cat.isCustom && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#FEFBE9]/50 rounded-2xl border border-[#E8E4D3]/70 mb-4 flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">Estimated Cost</span>
                  <span className="text-base font-bold text-[#22252A] font-['Outfit']">
                    {formatPHP(totalCost)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectCategory(cat.name)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FEFBE9] hover:bg-[#D7E9B9] border border-[#E8E4D3] text-xs font-semibold text-[#22252A] transition-colors cursor-pointer"
              >
                <span>View {catItems.length} items</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#556B2F]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#FEFBE9] rounded-3xl p-6 shadow-2xl border border-[#E8E4D3] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D3]">
              <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">Add Category</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Category Name *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Balcony, Study Nook, Pantry"
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                  required
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E4D3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D7E9B9] text-[#22252A] font-semibold px-4 py-1.5 rounded-xl border border-[#BADB88]"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#FEFBE9] rounded-3xl p-6 shadow-2xl border border-[#E8E4D3] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D3]">
              <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">Rename Category</h3>
              <button onClick={() => setEditingCategory(null)} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                  required
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E4D3]">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D7E9B9] text-[#22252A] font-semibold px-4 py-1.5 rounded-xl border border-[#BADB88]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
