import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  ShoppingBag,
  Store,
  DollarSign,
  Tag,
  Calendar,
  AlertCircle,
  Check,
  Star,
} from 'lucide-react';
import {
  MoveInItem,
  ItemCategory,
  StorePlatform,
  PriorityLevel,
  ItemStatus,
  PurchaseMethod,
  TimelineStage,
  PriceOption,
} from '../types';
import { formatPHP } from '../utils/currency';
import { compressImage } from '../utils/imageCompressor';
import { uploadProductImage } from '../firebase/storageService';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<MoveInItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  item?: MoveInItem | null;
  editingItem?: MoveInItem | null;
  categories: ItemCategory[];
  stores: StorePlatform[];
  userId?: string;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  editingItem: propEditingItem,
  categories,
  stores,
  userId,
}) => {
  if (!isOpen) return null;
  const editingItem = item || propEditingItem;

  const [name, setName] = useState(editingItem?.name || '');
  const [category, setCategory] = useState(editingItem?.category || categories[0]?.name || 'Sleeping');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [quantity, setQuantity] = useState(editingItem?.quantity?.toString() || '1');
  const [unitPrice, setUnitPrice] = useState(editingItem?.unitPrice?.toString() || '0');
  const [priority, setPriority] = useState<PriorityLevel>(editingItem?.priority || 'medium');
  const [status, setStatus] = useState<ItemStatus>(editingItem?.status || 'need_to_buy');
  const [purchaseMethod, setPurchaseMethod] = useState<PurchaseMethod>(editingItem?.purchaseMethod || 'online');
  const [store, setStore] = useState(editingItem?.store || 'Shopee');
  const [storeLocation, setStoreLocation] = useState(editingItem?.storeLocation || '');
  const [productUrl, setProductUrl] = useState(editingItem?.productUrl || '');
  const [imageUrl, setImageUrl] = useState(editingItem?.imageUrl || '');
  const [notes, setNotes] = useState(editingItem?.notes || '');
  const [targetPurchaseDate, setTargetPurchaseDate] = useState(editingItem?.targetPurchaseDate || '');
  const [isEssential, setIsEssential] = useState(editingItem?.isEssential ?? false);
  const [timelineStage, setTimelineStage] = useState<TimelineStage>(editingItem?.timelineStage || 'before_move');
  const [options, setOptions] = useState<PriceOption[]>(editingItem?.options || []);

  // New option temporary inputs
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptStore, setNewOptStore] = useState('TikTok Shop');
  const [newOptPrice, setNewOptPrice] = useState('');
  const [newOptUrl, setNewOptUrl] = useState('');

  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numQty = Math.max(1, parseInt(quantity) || 1);
  const numPrice = Math.max(0, parseFloat(unitPrice) || 0);
  const totalPrice = numQty * numPrice;

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, WebP).');
      return;
    }
    setIsCompressing(true);
    try {
      const url = await uploadProductImage(userId || 'anonymous', file);
      setImageUrl(url);
    } catch (err) {
      console.error('Image processing failed, falling back to local compression:', err);
      try {
        const compressed = await compressImage(file, 600, 0.75);
        setImageUrl(compressed);
      } catch {
        alert('Could not process image. Please try another image.');
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddOption = () => {
    const p = parseFloat(newOptPrice);
    if (!newOptStore || isNaN(p) || p < 0) {
      alert('Please provide a valid store name and non-negative price');
      return;
    }
    const newOption: PriceOption = {
      id: `opt-${Date.now()}`,
      store: newOptStore,
      price: p,
      productUrl: newOptUrl.trim() || undefined,
      isPreferred: options.length === 0,
    };
    setOptions([...options, newOption]);
    setNewOptPrice('');
    setNewOptUrl('');
    setShowAddOption(false);
  };

  const handleTogglePreferred = (optId: string) => {
    setOptions(
      options.map((o) => ({
        ...o,
        isPreferred: o.id === optId,
      }))
    );
  };

  const handleRemoveOption = (optId: string) => {
    setOptions(options.filter((o) => o.id !== optId));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Item name is required.';
    if (numPrice < 0 || isNaN(numPrice)) errs.price = 'Price cannot be negative.';
    if (numQty < 1 || isNaN(numQty)) errs.quantity = 'Quantity must be greater than zero.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        description: description.trim(),
        quantity: numQty,
        unitPrice: numPrice,
        totalPrice,
        priority,
        status,
        purchaseMethod,
        store,
        storeLocation: purchaseMethod === 'physical' ? storeLocation.trim() : undefined,
        productUrl: productUrl.trim() || undefined,
        imageUrl: imageUrl || undefined,
        notes: notes.trim(),
        targetPurchaseDate: targetPurchaseDate || undefined,
        isEssential,
        timelineStage,
        options: options.length > 0 ? options : undefined,
        alreadyOwned: status === 'already_owned',
        actualPricePaid: editingItem?.actualPricePaid,
        purchaseDate: editingItem?.purchaseDate,
        isDemo: editingItem?.isDemo ?? false,
      });
      onClose();
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find cheapest price in options if available
  const cheapestOption = options.length > 0 ? [...options].sort((a, b) => a.price - b.price)[0] : null;
  const preferredOption = options.find((o) => o.isPreferred) || (options.length > 0 ? options[0] : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#FEFBE9] rounded-3xl shadow-2xl border border-[#E8E4D3] overflow-hidden my-auto animate-in fade-in duration-150 text-left flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8E4D3] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#22252A] font-['Outfit']">
              {editingItem ? 'Edit Condo Item' : 'Add Item to Move-In List'}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {editingItem ? 'Update specifications, pricing, and purchase status.' : 'Plan, budget, and track another essential for your condo.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7280] hover:bg-[#FEFBE9] hover:text-[#22252A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="item-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Upper-Bunk Bedside Caddy"
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-[#22252A] placeholder-[#9CA3AF] focus:outline-hidden ${
                  errors.name ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-[#E8E4D3] focus:border-[#BADB88]'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2.5 text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Quantities with Live Auto-Calculated Total */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D3] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-[#2D3139] mb-1">
                  Unit Price (₱) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">₱</span>
                  <input
                    type="number"
                    id="item-unit-price-input"
                    step="any"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl text-sm font-medium text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                  />
                </div>
                {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D3139] mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  id="item-quantity-input"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl text-sm font-medium text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                />
                {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
              </div>

              <div className="sm:text-right pt-1 sm:pt-0">
                <span className="block text-xs text-[#6B7280]">Estimated Total</span>
                <span className="text-lg font-bold text-[#22252A] font-['Outfit']">
                  {formatPHP(totalPrice)}
                </span>
                <span className="block text-[11px] text-[#8A909D]">
                  Formula: {formatPHP(numPrice)} × {numQty}
                </span>
              </div>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">
                Priority <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['critical', 'high', 'medium', 'low', 'optional'] as PriorityLevel[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all capitalize border ${
                        isSelected
                          ? p === 'critical'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-[#D7E9B9] text-[#22252A] border-[#BADB88] shadow-xs'
                          : 'bg-white text-[#6B7280] border-[#E8E4D3] hover:bg-[#FEFBE9]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">
                Purchase Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3 py-2.5 text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
              >
                <option value="need_to_buy">● Need to Buy</option>
                <option value="researching">● Researching</option>
                <option value="planned">● Planned</option>
                <option value="ordered">● Ordered</option>
                <option value="purchased">✓ Purchased</option>
                <option value="already_owned">✓ Already Owned</option>
                <option value="no_longer_needed">✕ No Longer Needed</option>
              </select>
            </div>
          </div>

          {/* Store & Purchase Method */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2D3139]">Purchase Channel & Store</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseMethod('online');
                    if (!['Shopee', 'TikTok Shop', 'Lazada'].includes(store)) setStore('Shopee');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    purchaseMethod === 'online'
                      ? 'bg-[#D7E9B9] text-[#22252A] font-semibold'
                      : 'bg-[#FEFBE9] text-[#6B7280]'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseMethod('physical');
                    setStore('Physical Store');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    purchaseMethod === 'physical'
                      ? 'bg-[#D7E9B9] text-[#22252A] font-semibold'
                      : 'bg-[#FEFBE9] text-[#6B7280]'
                  }`}
                >
                  Physical Store
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#6B7280] mb-1">Store / Platform Name</label>
                <input
                  type="text"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder={purchaseMethod === 'online' ? 'Shopee, TikTok Shop, Lazada...' : 'SM Dept Store, Daiso, IKEA...'}
                  className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                />
              </div>

              {purchaseMethod === 'physical' ? (
                <div>
                  <label className="block text-[11px] text-[#6B7280] mb-1">Mall or Physical Location</label>
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    placeholder="e.g. Eastwood Mall 2F, SM Megamall"
                    className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] text-[#6B7280] mb-1">Product Link (Optional)</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://shopee.ph/..."
                      className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88] pr-8"
                    />
                    {productUrl && (
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#556B2F] hover:text-[#22252A]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alternative Price Comparison Options */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D3] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2D3139] block">Price Comparison & Options</span>
                <span className="text-[11px] text-[#6B7280]">
                  Compare alternative stores to buy at the best price.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOption(!showAddOption)}
                className="flex items-center gap-1 text-xs font-semibold text-[#556B2F] hover:text-[#22252A] bg-[#FEFBE9] px-2.5 py-1.5 rounded-lg border border-[#D7E9B9]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Option</span>
              </button>
            </div>

            {/* Existing Options List */}
            {options.length > 0 && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      opt.isPreferred
                        ? 'bg-[#EBF4D3]/40 border-[#BADB88]'
                        : 'bg-[#FEFBE9]/40 border-[#E8E4D3]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePreferred(opt.id)}
                        className={`p-1 rounded-md transition-colors ${
                          opt.isPreferred ? 'text-amber-600 bg-amber-100' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={opt.isPreferred ? 'Preferred Option' : 'Set as Preferred'}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <span className="font-semibold text-[#22252A]">{opt.store}</span>
                      <span className="text-[#6B7280]">— {formatPHP(opt.price)}</span>
                      {cheapestOption?.id === opt.id && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          Cheapest
                        </span>
                      )}
                      {opt.isPreferred && (
                        <span className="bg-[#D7E9B9] text-[#22252A] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          Preferred
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {opt.productUrl && (
                        <a
                          href={opt.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#556B2F] hover:underline"
                        >
                          Link
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Option Form */}
            {showAddOption && (
              <div className="p-3 bg-[#FEFBE9] rounded-xl border border-[#D7E9B9] space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newOptStore}
                    onChange={(e) => setNewOptStore(e.target.value)}
                    placeholder="Store (e.g. TikTok Shop)"
                    className="bg-white border border-[#E8E4D3] rounded-lg px-2.5 py-1.5"
                  />
                  <input
                    type="number"
                    step="any"
                    value={newOptPrice}
                    onChange={(e) => setNewOptPrice(e.target.value)}
                    placeholder="Price (₱)"
                    className="bg-white border border-[#E8E4D3] rounded-lg px-2.5 py-1.5"
                  />
                  <input
                    type="url"
                    value={newOptUrl}
                    onChange={(e) => setNewOptUrl(e.target.value)}
                    placeholder="Product Link"
                    className="bg-white border border-[#E8E4D3] rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddOption(false)}
                    className="text-gray-500 hover:text-gray-700 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="bg-[#D7E9B9] text-[#22252A] font-semibold px-3 py-1 rounded-lg border border-[#BADB88]"
                  >
                    Save Option
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Move-In Essential & Timeline Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D3] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2D3139] block">Move-In Essential</span>
                <span className="text-[11px] text-[#6B7280]">Must have before actual move-in day</span>
              </div>
              <input
                type="checkbox"
                id="item-essential-checkbox"
                checked={isEssential}
                onChange={(e) => setIsEssential(e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#556B2F] cursor-pointer"
              />
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4D3]">
              <label className="block text-xs font-semibold text-[#2D3139] mb-1">
                Moving Timeline Stage
              </label>
              <select
                value={timelineStage}
                onChange={(e) => setTimelineStage(e.target.value as TimelineStage)}
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-1.5 text-xs text-[#22252A] focus:outline-hidden"
              >
                <option value="before_move">1. Before Move (Must have on Day 1)</option>
                <option value="first_week">2. First Week (Settle in essentials)</option>
                <option value="after_settling_in">3. After Settling In (Nice to have later)</option>
              </select>
            </div>
          </div>

          {/* Product Image Upload with Desktop Drag-Drop and Mobile Touch */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D3] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2D3139] block">Product Image (Optional)</span>
                <span className="text-[11px] text-[#6B7280]">
                  Visually remember what you plan to buy. Images are automatically compressed.
                </span>
              </div>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageFile(e.target.files[0]);
                }
              }}
            />

            {imageUrl ? (
              <div className="flex items-center gap-4 p-2 bg-[#FEFBE9]/60 rounded-xl border border-[#E8E4D3]">
                <img
                  src={imageUrl}
                  alt={name || 'Product preview'}
                  className="w-20 h-20 object-cover rounded-lg border border-[#D7E9B9]"
                />
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#22252A] block">Image Ready</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-[#556B2F] hover:underline"
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D7E9B9] hover:border-[#BADB88] rounded-2xl p-6 text-center bg-[#FEFBE9]/40 cursor-pointer transition-colors"
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-2 text-xs text-[#556B2F]">
                    <div className="w-5 h-5 border-2 border-[#556B2F] border-t-transparent rounded-full animate-spin" />
                    <span>Compressing image for fast sync…</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-[#6B7280]">
                    <Upload className="w-5 h-5 text-[#556B2F]" />
                    <span className="font-semibold text-[#22252A]">
                      Click to upload or drag & drop photo
                    </span>
                    <span>PNG, JPG, or WebP</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key specifications, dimensions, color preferences..."
                className="w-full bg-white border border-[#E8E4D3] rounded-xl p-3 text-xs text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">
                Notes & Condo Reminders
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Confirm with roommate, requires 3M adhesive, no drilling..."
                className="w-full bg-white border border-[#E8E4D3] rounded-xl p-3 text-xs text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
              />
            </div>
          </div>

          {/* Target Purchase Date */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5">
              Target Purchase Date
            </label>
            <input
              type="date"
              value={targetPurchaseDate}
              onChange={(e) => setTargetPurchaseDate(e.target.value)}
              className="w-full sm:w-64 bg-white border border-[#E8E4D3] rounded-xl px-3 py-2 text-xs text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E4D3] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#6B7280] hover:text-[#22252A] px-4 py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            id="save-item-modal-btn"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isCompressing}
            className="flex items-center gap-2 bg-[#D7E9B9] hover:bg-[#C5DF9E] text-[#22252A] font-semibold py-2.5 px-6 rounded-xl shadow-xs transition-all border border-[#BADB88] text-sm cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-[#22252A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{editingItem ? 'Save Changes' : 'Add Item'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
