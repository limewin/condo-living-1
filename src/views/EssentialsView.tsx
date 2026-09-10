import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  PackageCheck,
  Moon,
  ShieldCheck,
  Zap,
  Bath,
  Droplet,
} from 'lucide-react';
import { MoveInItem } from '../types';
import { formatPHP } from '../utils/currency';

interface EssentialsViewProps {
  items: MoveInItem[];
  onOpenMarkPurchased: (item: MoveInItem) => void;
  onEditItem: (item: MoveInItem) => void;
  onOpenAddItem: () => void;
}

export const EssentialsView: React.FC<EssentialsViewProps> = ({
  items,
  onOpenMarkPurchased,
  onEditItem,
  onOpenAddItem,
}) => {
  // Items that are essential OR marked as before_move OR critical
  const essentialItems = items.filter(
    (i) => (i.isEssential || i.priority === 'critical') && i.status !== 'no_longer_needed'
  );

  const readyItems = essentialItems.filter(
    (i) => i.status === 'purchased' || i.status === 'already_owned'
  );
  const pendingItems = essentialItems.filter(
    (i) => i.status !== 'purchased' && i.status !== 'already_owned'
  );

  const totalCost = essentialItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const pendingCost = pendingItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const percentReady =
    essentialItems.length > 0 ? Math.round((readyItems.length / essentialItems.length) * 100) : 0;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E4D3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Day-1 Readiness Checklist
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit']">
            First-Night Move-In Essentials
          </h2>
          <p className="text-xs text-[#6B7280]">
            The absolute bare minimum items you need to sleep, shower, charge your devices, and survive Night 1 in the condo.
          </p>
        </div>

        {/* Readiness Meter Card */}
        <div className="bg-[#FEFBE9] rounded-2xl p-4 border border-[#D7E9B9] shrink-0 min-w-[200px] text-left">
          <span className="text-[11px] font-bold text-[#6B7280] block">First-Night Readiness</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#22252A] font-['Outfit']">
              {readyItems.length}/{essentialItems.length}
            </span>
            <span className="text-xs font-semibold text-[#556B2F]">({percentReady}%)</span>
          </div>
          <div className="w-full h-2 bg-[#E8E4D3] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[#8EAE56] rounded-full transition-all duration-300"
              style={{ width: `${percentReady}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Essential Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {essentialItems.map((item) => {
          const isReady = item.status === 'purchased' || item.status === 'already_owned';

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isReady
                  ? 'bg-[#FEFBE9]/40 border-emerald-200'
                  : 'bg-white border-[#E8E4D3] hover:border-[#D7E9B9] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#556B2F] bg-[#EBF4D3] px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  {isReady ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready for Night 1</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Needs Purchase</span>
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3 mt-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E8E4D3] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#FEFBE9] border border-[#E8E4D3] flex items-center justify-center shrink-0 text-[#8EAE56]">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => onEditItem(item)}
                      className="text-sm sm:text-base font-bold text-[#22252A] font-['Outfit'] hover:underline cursor-pointer"
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Store: {item.store} • Qty: {item.quantity}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-[#4A505B] mt-1 line-clamp-1 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-4 pt-3 border-t border-[#E8E4D3]/70 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-[#22252A] font-['Outfit']">
                    {formatPHP(item.totalPrice)}
                  </span>
                  <span className="text-[11px] text-[#8A909D] ml-1">
                    ({formatPHP(item.unitPrice)} ea)
                  </span>
                </div>

                {!isReady ? (
                  <button
                    onClick={() => onOpenMarkPurchased(item)}
                    className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold text-xs px-3.5 py-1.5 rounded-xl border border-[#BADB88] transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Got it</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold">Packed & Checked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {essentialItems.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E4D3]">
          <Sparkles className="w-10 h-10 text-[#8EAE56] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#22252A]">No items tagged as essential yet</p>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">
            Mark items as "Move-in Essential" in the Add Item modal.
          </p>
          <button
            onClick={onOpenAddItem}
            className="inline-flex items-center gap-1.5 bg-[#D7E9B9] text-[#22252A] font-semibold px-4 py-2 rounded-xl text-xs border border-[#BADB88]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Essential Item</span>
          </button>
        </div>
      )}
    </div>
  );
};
