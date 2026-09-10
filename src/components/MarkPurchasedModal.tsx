import React, { useState } from 'react';
import { X, Check, DollarSign, Calendar, Store, FileText } from 'lucide-react';
import { MoveInItem, StorePlatform } from '../types';
import { formatPHP } from '../utils/currency';

interface MarkPurchasedModalProps {
  isOpen: boolean;
  item: MoveInItem | null;
  stores: StorePlatform[];
  onClose: () => void;
  onConfirm: (itemId: string, actualPrice: number, purchaseDate: string, storeUsed: string, note?: string) => Promise<void>;
}

export const MarkPurchasedModal: React.FC<MarkPurchasedModalProps> = ({
  isOpen,
  item,
  stores,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [actualPrice, setActualPrice] = useState(
    item.actualPricePaid?.toString() || item.totalPrice.toString()
  );
  const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate || todayStr);
  const [storeUsed, setStoreUsed] = useState(item.store || 'Shopee');
  const [purchaseNote, setPurchaseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numActualPrice = Math.max(0, parseFloat(actualPrice) || 0);
  const priceDiff = numActualPrice - item.totalPrice;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(
        item.id,
        numActualPrice,
        purchaseDate,
        storeUsed,
        purchaseNote.trim() || undefined
      );
      onClose();
    } catch (err) {
      console.error('Failed to mark purchased:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#FEFBE9] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8E4D3] text-left animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D3]">
          <div>
            <h3 className="text-lg font-bold text-[#22252A] font-['Outfit']">Mark as Purchased</h3>
            <p className="text-xs text-[#6B7280] truncate max-w-xs">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-[#EAE5D2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Estimated vs Actual */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8E4D3] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#6B7280] block">Estimated Total</span>
              <span className="text-sm font-semibold text-[#22252A]">{formatPHP(item.totalPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#6B7280] block">Variance</span>
              <span className={`text-xs font-bold ${priceDiff > 0 ? 'text-rose-600' : priceDiff < 0 ? 'text-emerald-700' : 'text-gray-600'}`}>
                {priceDiff === 0 ? 'Exact match' : `${priceDiff > 0 ? '+' : ''}${formatPHP(priceDiff)}`}
              </span>
            </div>
          </div>

          {/* Actual Price Paid */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#556B2F]" />
              Actual Price Paid (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">₱</span>
              <input
                type="number"
                step="any"
                min="0"
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#E8E4D3] rounded-xl text-sm font-semibold text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
                required
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#556B2F]" />
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3.5 py-2 text-xs text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
              required
            />
          </div>

          {/* Store Used */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#556B2F]" />
              Store Used
            </label>
            <input
              type="text"
              value={storeUsed}
              onChange={(e) => setStoreUsed(e.target.value)}
              placeholder="e.g. Shopee, TikTok Shop, SM"
              className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3.5 py-2 text-xs text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
              required
            />
          </div>

          {/* Quick Note */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#556B2F]" />
              Purchase Note (Optional)
            </label>
            <input
              type="text"
              value={purchaseNote}
              onChange={(e) => setPurchaseNote(e.target.value)}
              placeholder="e.g. Bought during 9.9 mega sale with voucher"
              className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3.5 py-2 text-xs text-[#22252A] focus:outline-hidden focus:border-[#BADB88]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8E4D3]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-[#6B7280] hover:text-[#22252A] px-4 py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-purchased-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C5DF9E] text-[#22252A] font-semibold py-2 px-5 rounded-xl shadow-xs transition-all border border-[#BADB88] text-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Purchased</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
