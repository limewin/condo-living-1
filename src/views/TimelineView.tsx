import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Sparkles,
} from 'lucide-react';
import { MoveInItem, TimelineStage } from '../types';
import { formatPHP } from '../utils/currency';

interface TimelineViewProps {
  items: MoveInItem[];
  onUpdateStage: (itemId: string, newStage: TimelineStage) => Promise<void>;
  onOpenMarkPurchased: (item: MoveInItem) => void;
  onEditItem: (item: MoveInItem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  items,
  onUpdateStage,
  onOpenMarkPurchased,
  onEditItem,
}) => {
  const activeItems = items.filter((i) => i.status !== 'no_longer_needed');

  const stages: {
    key: TimelineStage;
    title: string;
    description: string;
    badgeBg: string;
  }[] = [
    {
      key: 'before_move',
      title: 'Stage 1: Before Move-In',
      description: 'Must have procured, delivered, or packed prior to Day 1.',
      badgeBg: 'bg-rose-100 text-rose-800',
    },
    {
      key: 'first_week',
      title: 'Stage 2: First Week',
      description: 'Settling in, storage racks, laundry hampers, organizers.',
      badgeBg: 'bg-[#D7E9B9] text-[#22252A]',
    },
    {
      key: 'after_settling_in',
      title: 'Stage 3: After Settling In',
      description: 'Comfort enhancements, extra decor, desk upgrades, spare items.',
      badgeBg: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
            Phased Logistics
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
          Chronological Moving Timeline
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Avoid move-in day overwhelm by staging your deliveries and shopping runs in phases.
        </p>
      </div>

      {/* Stages Column/Cards */}
      <div className="space-y-6">
        {stages.map((stage, idx) => {
          const stageItems = activeItems.filter((i) => i.timelineStage === stage.key);
          const stageTotal = stageItems.reduce((sum, i) => sum + i.totalPrice, 0);
          const stageDone = stageItems.filter(
            (i) => i.status === 'purchased' || i.status === 'already_owned'
          ).length;

          return (
            <div
              key={stage.key}
              className="bg-white rounded-3xl border border-[#E8E4D3] shadow-xs overflow-hidden"
            >
              {/* Stage Header */}
              <div className="p-5 bg-[#FEFBE9]/70 border-b border-[#E8E4D3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${stage.badgeBg}`}>
                      Phase {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                      {stage.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{stage.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-[#556B2F]">
                    {stageDone}/{stageItems.length} acquired
                  </span>
                  <span className="block text-sm font-bold text-[#22252A] font-['Outfit']">
                    {formatPHP(stageTotal)}
                  </span>
                </div>
              </div>

              {/* Items in Stage */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stageItems.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-xs text-[#8A909D]">
                    No items assigned to this stage.
                  </div>
                ) : (
                  stageItems.map((item) => {
                    const isDone = item.status === 'purchased' || item.status === 'already_owned';

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isDone
                            ? 'bg-[#FEFBE9]/30 border-emerald-200'
                            : 'bg-white border-[#E8E4D3] hover:border-[#D7E9B9]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4
                              onClick={() => onEditItem(item)}
                              className="text-xs font-bold text-[#22252A] font-['Outfit'] hover:underline cursor-pointer line-clamp-1"
                            >
                              {item.name}
                            </h4>
                            {isDone && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                            <span>{item.store}</span>
                            <span className="font-semibold text-[#22252A]">
                              {formatPHP(item.totalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Reassign Stage dropdown */}
                        <div className="mt-3 pt-2 border-t border-[#E8E4D3]/60 flex items-center justify-between text-[11px]">
                          <select
                            value={item.timelineStage}
                            onChange={(e) =>
                              onUpdateStage(item.id, e.target.value as TimelineStage)
                            }
                            className="bg-[#FEFBE9] border border-[#E8E4D3] rounded-lg px-2 py-0.5 text-[10px] text-[#22252A]"
                          >
                            <option value="before_move">1. Before Move</option>
                            <option value="first_week">2. First Week</option>
                            <option value="after_settling_in">3. After Settling In</option>
                          </select>

                          {!isDone && (
                            <button
                              onClick={() => onOpenMarkPurchased(item)}
                              className="text-[10px] font-semibold text-[#556B2F] hover:underline"
                            >
                              Got it
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
