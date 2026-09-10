import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Store,
  DollarSign,
  Star,
  Tag,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import {
  MoveInItem,
  ItemCategory,
  StorePlatform,
  PriorityLevel,
  ItemStatus,
  PurchaseMethod,
  SortOption,
} from '../types';
import { formatPHP } from '../utils/currency';

interface ItemsViewProps {
  items: MoveInItem[];
  categories: ItemCategory[];
  stores: StorePlatform[];
  onOpenAddItem: () => void;
  onEditItem: (item: MoveInItem) => void;
  onDeleteItem: (itemId: string) => Promise<void>;
  onOpenMarkPurchased: (item: MoveInItem) => void;
  onBulkMarkPurchased: (itemIds: string[]) => Promise<void>;
  onBulkDelete: (itemIds: string[]) => Promise<void>;
}

export const ItemsView: React.FC<ItemsViewProps> = ({
  items,
  categories,
  stores,
  onOpenAddItem,
  onEditItem,
  onDeleteItem,
  onOpenMarkPurchased,
  onBulkMarkPurchased,
  onBulkDelete,
}) => {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [onlyEssential, setOnlyEssential] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  // Selected items for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Priority weight for sorting
  const priorityWeight: Record<PriorityLevel, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    optional: 1,
  };

  // Filter & Sort Pipeline
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search text matching
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchStore = item.store.toLowerCase().includes(q);
          const matchNotes = (item.notes || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchStore && !matchNotes && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'purchased_group') {
            if (item.status !== 'purchased' && item.status !== 'already_owned') return false;
          } else if (selectedStatus === 'unpurchased_group') {
            if (item.status === 'purchased' || item.status === 'already_owned' || item.status === 'no_longer_needed') {
              return false;
            }
          } else if (item.status !== selectedStatus) {
            return false;
          }
        }

        // Store filter
        if (selectedStore !== 'all' && item.store !== selectedStore) {
          return false;
        }

        // Purchase method
        if (selectedMethod !== 'all' && item.purchaseMethod !== selectedMethod) {
          return false;
        }

        // Price range
        if (selectedPriceRange !== 'all') {
          const p = item.totalPrice;
          if (selectedPriceRange === 'under_500' && p >= 500) return false;
          if (selectedPriceRange === '500_1000' && (p < 500 || p > 1000)) return false;
          if (selectedPriceRange === '1000_2500' && (p < 1000 || p > 2500)) return false;
          if (selectedPriceRange === '2500_plus' && p <= 2500) return false;
        }

        // Essential only
        if (onlyEssential && !item.isEssential) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        if (sortBy === 'price_desc') {
          return b.totalPrice - a.totalPrice;
        }
        if (sortBy === 'price_asc') {
          return a.totalPrice - b.totalPrice;
        }
        if (sortBy === 'recent_added') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'category') {
          return a.category.localeCompare(b.category);
        }
        if (sortBy === 'store') {
          return a.store.localeCompare(b.store);
        }
        return 0;
      });
  }, [
    items,
    search,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    selectedStore,
    selectedMethod,
    selectedPriceRange,
    onlyEssential,
    sortBy,
  ]);

  // Bulk Selection Toggles
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getPriorityBadgeClass = (priority: PriorityLevel) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'medium':
        return 'bg-[#EBF4D3] text-[#3C4E20] border-[#BADB88]';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'optional':
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'purchased':
        return { label: 'Purchased', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'already_owned':
        return { label: 'Already Owned', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'need_to_buy':
        return { label: 'Need to Buy', class: 'bg-[#FEFBE9] text-[#556B2F] border-[#BADB88]' };
      case 'researching':
        return { label: 'Researching', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'planned':
        return { label: 'Planned', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'ordered':
        return { label: 'Ordered', class: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'no_longer_needed':
        return { label: 'No Longer Needed', class: 'bg-gray-100 text-gray-400 border-gray-200 line-through' };
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedStore('all');
    setSelectedMethod('all');
    setSelectedPriceRange('all');
    setOnlyEssential(false);
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPriority !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedStore !== 'all' ? 1 : 0) +
    (selectedMethod !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (onlyEssential ? 1 : 0);

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200">
      {/* Top Controls: Search Bar & Primary Actions */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E4D3] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              id="search-items-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, categories, stores, notes, specs..."
              className="w-full pl-9 pr-8 py-2.5 bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-2xl text-xs sm:text-sm text-[#22252A] placeholder-[#8A909D] focus:outline-hidden focus:border-[#BADB88]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Controls: Filter Drawer Toggle, Sort Dropdown, Add Item */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-[#FEFBE9]/60 border border-[#E8E4D3] rounded-2xl px-3 py-2 text-xs font-semibold text-[#2D3139]">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-[#556B2F]" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="priority">Priority: Highest</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="recent_added">Date Added</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="category">Category</option>
                <option value="store">Store</option>
              </select>
            </div>

            {/* Filter Drawer Toggle */}
            <button
              id="toggle-filters-btn"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors cursor-pointer ${
                activeFilterCount > 0 || showFiltersDrawer
                  ? 'bg-[#D7E9B9] text-[#22252A] border-[#BADB88]'
                  : 'bg-white text-[#4A505B] border-[#E8E4D3] hover:bg-[#FEFBE9]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#22252A] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add Item Button */}
            <button
              onClick={onOpenAddItem}
              className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-3.5 py-2 rounded-2xl text-xs shadow-xs border border-[#BADB88] cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips (Category pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-colors border font-medium ${
              selectedCategory === 'all'
                ? 'bg-[#22252A] text-white border-[#22252A]'
                : 'bg-[#FEFBE9] text-[#4A505B] border-[#E8E4D3] hover:bg-white'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-colors border text-xs font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#D7E9B9] text-[#22252A] border-[#BADB88] font-semibold'
                    : 'bg-[#FEFBE9] text-[#4A505B] border-[#E8E4D3] hover:bg-white'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Filters Drawer */}
        {showFiltersDrawer && (
          <div className="p-4 bg-[#FEFBE9] rounded-2xl border border-[#E8E4D3] space-y-3 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D3]/70">
              <span className="text-xs font-bold text-[#22252A] font-['Outfit']">Detailed Filters</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#556B2F] font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="optional">Optional</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="unpurchased_group">Unpurchased Only</option>
                  <option value="purchased_group">Purchased / Owned</option>
                  <option value="need_to_buy">Need to Buy</option>
                  <option value="researching">Researching</option>
                  <option value="planned">Planned</option>
                  <option value="ordered">Ordered</option>
                </select>
              </div>

              {/* Store */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Store / Channel</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                >
                  <option value="all">All Stores</option>
                  <option value="Shopee">Shopee</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                  <option value="Lazada">Lazada</option>
                  <option value="Physical Store">Physical Store</option>
                  {stores
                    .filter((s) => !['Shopee', 'TikTok Shop', 'Lazada', 'Physical Store'].includes(s.name))
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Price Bracket</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full bg-white border border-[#E8E4D3] rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                >
                  <option value="all">Any Price</option>
                  <option value="under_500">Under ₱500</option>
                  <option value="500_1000">₱500 – ₱1,000</option>
                  <option value="1000_2500">₱1,000 – ₱2,500</option>
                  <option value="2500_plus">₱2,500+</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2D3139]">
                <input
                  type="checkbox"
                  checked={onlyEssential}
                  onChange={(e) => setOnlyEssential(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#556B2F]"
                />
                <span>Move-in Essential items only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#22252A] text-white rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2 duration-150 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleToggleSelectAll}
              className="text-gray-300 hover:text-white underline text-[11px]"
            >
              {selectedIds.length === filteredItems.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkMarkPurchased(selectedIds).then(() => setSelectedIds([]))}
              className="flex items-center gap-1.5 bg-[#D7E9B9] text-[#22252A] font-semibold px-3 py-1.5 rounded-xl hover:bg-[#C2DE9B] transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Purchased</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.length} selected items?`)) {
                  onBulkDelete(selectedIds).then(() => setSelectedIds([]));
                }
              }}
              className="flex items-center gap-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ITEMS LIST / GRID */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E4D3] shadow-xs">
          <Package className="w-12 h-12 text-[#8EAE56] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">No items found</h3>
          <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1 mb-5">
            {items.length === 0
              ? 'Your move-in inventory is empty. Start adding what you need for your condo!'
              : 'Try clearing your filters or search keywords to see your items.'}
          </p>
          {items.length === 0 ? (
            <button
              onClick={onOpenAddItem}
              className="inline-flex items-center gap-2 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-xl text-xs shadow-xs border border-[#BADB88]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Item</span>
            </button>
          ) : (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#556B2F] underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isPurchased = item.status === 'purchased' || item.status === 'already_owned';
            const statusInfo = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                id={`item-card-${item.id}`}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#BADB88] ring-2 ring-[#BADB88]/40 bg-[#FEFBE9]/30'
                    : isPurchased
                    ? 'border-[#E8E4D3] bg-white/90'
                    : 'border-[#E8E4D3] hover:border-[#D7E9B9]'
                }`}
              >
                <div>
                  {/* Card Header: Checkbox + Priority + Status Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSelectItem(item.id)}
                        className="text-gray-400 hover:text-[#22252A] transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#556B2F]" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadgeClass(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>

                      {item.isEssential && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Essential</span>
                        </span>
                      )}

                      {item.isDemo && (
                        <span className="text-[9px] bg-gray-100 text-gray-500 font-semibold px-1.5 py-0.5 rounded-md">
                          DEMO
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.class}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Body: Thumbnail & Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-[#E8E4D3] shrink-0 bg-[#FEFBE9]"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#FEFBE9] border border-[#E8E4D3] flex items-center justify-center shrink-0 text-[#8EAE56]">
                        <Package className="w-7 h-7" />
                      </div>
                    )}

                    {/* Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          className={`text-sm sm:text-base font-bold text-[#22252A] font-['Outfit'] leading-snug line-clamp-2 ${
                            isPurchased ? 'text-gray-700' : ''
                          }`}
                        >
                          {item.name}
                        </h4>
                      </div>

                      {/* Category & Store Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] text-[#556B2F] font-semibold bg-[#EBF4D3] px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>

                        <span className="text-[11px] text-[#6B7280] font-medium bg-[#FEFBE9] border border-[#E8E4D3] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Store className="w-3 h-3 text-[#8A909D]" />
                          <span>{item.store}</span>
                          <span className="text-[10px] opacity-70">
                            ({item.purchaseMethod === 'online' ? 'Online' : 'Physical'})
                          </span>
                        </span>
                      </div>

                      {/* Specs / Description preview */}
                      {item.description && (
                        <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-1.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Quantity Strip */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#E8E4D3]/70 flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-[#22252A] font-['Outfit']">
                        {formatPHP(item.totalPrice)}
                      </span>
                      <span className="text-[11px] text-[#8A909D] ml-1.5">
                        ({formatPHP(item.unitPrice)} × {item.quantity})
                      </span>
                      {item.actualPricePaid !== undefined && isPurchased && (
                        <span className="block text-[10px] text-emerald-700 font-semibold">
                          Paid: {formatPHP(item.actualPricePaid)}
                        </span>
                      )}
                    </div>

                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#556B2F] hover:text-[#22252A] bg-[#FEFBE9] px-2.5 py-1 rounded-lg border border-[#D7E9B9]"
                      >
                        <span>View Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-[#E8E4D3]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-item-${item.id}`}
                      onClick={() => onEditItem(item)}
                      className="p-1.5 text-gray-500 hover:text-[#22252A] hover:bg-[#FEFBE9] rounded-xl transition-colors"
                      title="Edit Item Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-semibold">Delete?</span>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-[10px] font-bold text-rose-700 hover:underline"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] text-gray-500 hover:underline ml-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`delete-item-${item.id}`}
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Mark as Purchased Action */}
                  {!isPurchased ? (
                    <button
                      id={`mark-purchased-${item.id}`}
                      onClick={() => onOpenMarkPurchased(item)}
                      className="flex items-center gap-1 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold text-xs px-3 py-1.5 rounded-xl border border-[#BADB88] shadow-2xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Purchased</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready for move</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
