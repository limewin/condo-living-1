import React, { useState } from 'react';
import {
  Store,
  Plus,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  MapPin,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { MoveInItem, StorePlatform } from '../types';
import { formatPHP } from '../utils/currency';

interface StoresViewProps {
  stores: StorePlatform[];
  items: MoveInItem[];
  onSelectStore: (storeName: string) => void;
  onAddStore: (store: Omit<StorePlatform, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  onDeleteStore: (storeId: string) => Promise<void>;
}

export const StoresView: React.FC<StoresViewProps> = ({
  stores,
  items,
  onSelectStore,
  onAddStore,
  onDeleteStore,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreType, setNewStoreType] = useState<'online' | 'physical'>('online');
  const [newStoreLocation, setNewStoreLocation] = useState('');
  const [newStoreNotes, setNewStoreNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compile list of unique store names
  const allStoreNames = Array.from(
    new Set([...stores.map((s) => s.name), ...items.map((i) => i.store)])
  ).filter(Boolean);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddStore({
        name: newStoreName.trim(),
        type: newStoreType,
        location: newStoreLocation.trim() || undefined,
        notes: newStoreNotes.trim() || undefined,
        isCustom: true,
      });
      setNewStoreName('');
      setNewStoreLocation('');
      setNewStoreNotes('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating store:', err);
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
              Store Logistics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
            Stores & Shopping Platforms
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Organize orders across online platforms and physical shopping trips.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-2xl text-xs shadow-xs border border-[#BADB88] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Store</span>
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allStoreNames.map((storeName) => {
          const storeItems = items.filter((i) => i.store === storeName && i.status !== 'no_longer_needed');
          const storeRecord = stores.find((s) => s.name === storeName);

          const totalEstimated = storeItems.reduce((sum, i) => sum + i.totalPrice, 0);
          const purchasedItems = storeItems.filter(
            (i) => i.status === 'purchased' || i.status === 'already_owned'
          );
          const totalPurchased = purchasedItems.reduce(
            (sum, i) => sum + (i.actualPricePaid ?? i.totalPrice),
            0
          );
          const neededItems = storeItems.filter(
            (i) => i.status !== 'purchased' && i.status !== 'already_owned'
          );
          const totalRemaining = neededItems.reduce((sum, i) => sum + i.totalPrice, 0);

          const isPhysical = storeRecord?.type === 'physical' || storeName.toLowerCase().includes('physical');

          return (
            <div
              key={storeName}
              className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs flex flex-col justify-between hover:border-[#D7E9B9] transition-all"
            >
              <div>
                {/* Store Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#22252A]">
                      <Store className="w-4 h-4 text-[#556B2F]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                        {storeName}
                      </h3>
                      <span className="text-[10px] text-[#6B7280]">
                        {isPhysical ? 'Physical Store' : 'Online Platform'}
                      </span>
                    </div>
                  </div>

                  {storeRecord?.isCustom && (
                    <button
                      onClick={() => onDeleteStore(storeRecord.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                      title="Delete store"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {storeRecord?.location && (
                  <p className="text-xs text-[#556B2F] flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{storeRecord.location}</span>
                  </p>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#FEFBE9]/50 rounded-2xl border border-[#E8E4D3]/70 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-[#8A909D] block">Items Left</span>
                    <span className="text-sm font-bold text-[#22252A] font-['Outfit']">
                      {neededItems.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A909D] block">Spent</span>
                    <span className="text-xs font-bold text-emerald-700 font-['Outfit']">
                      {formatPHP(totalPurchased, { showCents: false })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A909D] block">Remaining</span>
                    <span className="text-xs font-bold text-[#22252A] font-['Outfit']">
                      {formatPHP(totalRemaining, { showCents: false })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectStore(storeName)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FEFBE9] hover:bg-[#D7E9B9] border border-[#E8E4D3] hover:border-[#BADB88] text-xs font-semibold text-[#22252A] transition-colors cursor-pointer"
              >
                <span>Filter all items from this store</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#556B2F]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#FEFBE9] rounded-3xl p-6 shadow-2xl border border-[#E8E4D3] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D3]">
              <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">Add Custom Store</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Store Name *</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Muji, Japanese Home, Ace Hardware"
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Store Type</label>
                <select
                  value={newStoreType}
                  onChange={(e) => setNewStoreType(e.target.value as 'online' | 'physical')}
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
                >
                  <option value="online">Online Platform</option>
                  <option value="physical">Physical Mall / Store</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Mall / Location (Optional)</label>
                <input
                  type="text"
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                  placeholder="e.g. SM North EDSA, Robinsons Galleria"
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3139] mb-1">Notes</label>
                <input
                  type="text"
                  value={newStoreNotes}
                  onChange={(e) => setNewStoreNotes(e.target.value)}
                  placeholder="e.g. Check clearance bins on weekends"
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E4D3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-gray-600 hover:text-black font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-xl border border-[#BADB88]"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
