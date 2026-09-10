import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Square,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Store,
  Sparkles,
  DollarSign,
  Eye,
  EyeOff,
  Package,
} from 'lucide-react';
import { MoveInItem } from '../types';
import { formatPHP } from '../utils/currency';

interface ShoppingModeViewProps {
  items: MoveInItem[];
  onOpenMarkPurchased: (item: MoveInItem) => void;
  onQuickTogglePurchased: (item: MoveInItem) => void;
}

export const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  items,
  onOpenMarkPurchased,
  onQuickTogglePurchased,
}) => {
  const [hidePurchased, setHidePurchased] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Group active items by store
  const activeItems = items.filter((i) => i.status !== 'no_longer_needed');
  
  // Grouping
  const storeGroups: Record<string, MoveInItem[]> = {};
  activeItems.forEach((item) => {
    const storeKey = item.store || 'Other';
    if (!storeGroups[storeKey]) storeGroups[storeKey] = [];
    storeGroups[storeKey].push(item);
  });

  const storesList = Object.keys(storeGroups).sort((a, b) => {
    // Primary online stores first
    const order = ['Shopee', 'TikTok Shop', 'Lazada', 'Physical Store', 'IKEA / Muji', 'Daiso / Japan Home Centre'];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Active Shopping Mode
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#22252A] font-['Outfit']">
            Store Shopping Runs
          </h2>
          <p className="text-xs text-[#6B7280]">
            Distraction-free checklist grouped by store for checkout on Shopee, TikTok Shop, or in physical malls.
          </p>
        </div>

        {/* Toggle hide purchased */}
        <button
          onClick={() => setHidePurchased(!hidePurchased)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FEFBE9] border border-[#D7E9B9] text-xs font-semibold text-[#2D3139] hover:bg-white transition-colors cursor-pointer"
        >
          {hidePurchased ? <EyeOff className="w-4 h-4 text-[#556B2F]" /> : <Eye className="w-4 h-4 text-[#556B2F]" />}
          <span>{hidePurchased ? 'Showing: Unpurchased' : 'Showing: All Items'}</span>
        </button>
      </div>

      {/* Stores checklist */}
      {storesList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E4D3]">
          <ShoppingBag className="w-12 h-12 text-[#8EAE56] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#22252A]">No shopping items added yet</p>
          <p className="text-xs text-[#6B7280] mt-1">Add items with their designated store to begin.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {storesList.map((storeName) => {
            const allStoreItems = storeGroups[storeName] || [];
            const displayItems = hidePurchased
              ? allStoreItems.filter((i) => i.status !== 'purchased' && i.status !== 'already_owned')
              : allStoreItems;

            if (displayItems.length === 0 && hidePurchased) {
              return null;
            }

            const unpurchasedCount = allStoreItems.filter(
              (i) => i.status !== 'purchased' && i.status !== 'already_owned'
            ).length;

            const subtotalPending = allStoreItems
              .filter((i) => i.status !== 'purchased' && i.status !== 'already_owned')
              .reduce((sum, item) => sum + item.totalPrice, 0);

            const isPhysical = allStoreItems.some((i) => i.purchaseMethod === 'physical');

            return (
              <div
                key={storeName}
                className="bg-white rounded-3xl border border-[#E8E4D3] shadow-xs overflow-hidden"
              >
                {/* Store Header with Subtotal */}
                <div className="px-5 py-3.5 bg-[#FEFBE9]/70 border-b border-[#E8E4D3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#D7E9B9] flex items-center justify-center text-[#22252A]">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                          {storeName}
                        </h3>
                        <span className="text-[10px] font-semibold text-[#556B2F] bg-[#EBF4D3] px-2 py-0.5 rounded-full border border-[#BADB88]">
                          {isPhysical ? 'Physical Store' : 'Online Platform'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280]">
                        {unpurchasedCount} {unpurchasedCount === 1 ? 'item' : 'items'} to buy
                      </span>
                    </div>
                  </div>

                  {/* Subtotal Banner */}
                  <div className="text-right">
                    <span className="text-[11px] text-[#8A909D] block">Subtotal</span>
                    <span className="text-base font-bold text-[#22252A] font-['Outfit']">
                      {formatPHP(subtotalPending)}
                    </span>
                  </div>
                </div>

                {/* Store Items List */}
                <div className="divide-y divide-[#E8E4D3]/60">
                  {displayItems.map((item) => {
                    const isPurchased = item.status === 'purchased' || item.status === 'already_owned';
                    const isExpanded = expandedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 transition-colors ${
                          isPurchased ? 'bg-emerald-50/20 opacity-70' : 'hover:bg-[#FEFBE9]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Left: Checkbox + Thumbnail + Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => {
                                if (!isPurchased) {
                                  onOpenMarkPurchased(item);
                                } else {
                                  onQuickTogglePurchased(item);
                                }
                              }}
                              className="text-gray-400 hover:text-[#556B2F] transition-colors p-1"
                              title={isPurchased ? 'Mark as needed' : 'Mark as purchased'}
                            >
                              {isPurchased ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>

                            {/* Thumbnail */}
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-[#E8E4D3] shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-[#FEFBE9] border border-[#E8E4D3] flex items-center justify-center shrink-0 text-[#8EAE56]">
                                <Package className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-bold text-[#22252A] font-['Outfit'] truncate ${
                                    isPurchased ? 'line-through text-gray-500' : ''
                                  }`}
                                >
                                  {item.name}
                                </span>
                                {item.isEssential && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-md shrink-0">
                                    Essential
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Total Price + Expand button */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-sm sm:text-base font-bold text-[#22252A] font-['Outfit']">
                                {formatPHP(item.totalPrice)}
                              </span>
                              <span className="block text-[10px] text-[#8A909D]">
                                ({formatPHP(item.unitPrice)} each)
                              </span>
                            </div>

                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Details Drawer */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-[#E8E4D3]/60 pl-8 space-y-2 text-xs text-[#4A505B] animate-in fade-in duration-150">
                            {item.description && (
                              <p className="leading-relaxed">
                                <strong className="text-[#22252A]">Specs:</strong> {item.description}
                              </p>
                            )}
                            {item.notes && (
                              <p className="leading-relaxed">
                                <strong className="text-[#22252A]">Reminders:</strong> {item.notes}
                              </p>
                            )}
                            {item.storeLocation && (
                              <p>
                                <strong className="text-[#22252A]">Location:</strong> {item.storeLocation}
                              </p>
                            )}
                            {item.targetPurchaseDate && (
                              <p>
                                <strong className="text-[#22252A]">Target Date:</strong> {item.targetPurchaseDate}
                              </p>
                            )}

                            {item.productUrl && (
                              <div className="pt-1">
                                <a
                                  href={item.productUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[#556B2F] font-semibold hover:underline bg-[#FEFBE9] px-2.5 py-1 rounded-lg border border-[#D7E9B9]"
                                >
                                  <span>Open Item Page</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
