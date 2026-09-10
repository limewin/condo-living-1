import React from 'react';
import {
  Columns,
  AlertTriangle,
  Flame,
  Clock,
  Coffee,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Package,
} from 'lucide-react';
import { MoveInItem, PriorityLevel } from '../types';
import { formatPHP } from '../utils/currency';

interface PriorityBoardViewProps {
  items: MoveInItem[];
  onUpdatePriority: (itemId: string, newPriority: PriorityLevel) => Promise<void>;
  onOpenMarkPurchased: (item: MoveInItem) => void;
  onEditItem: (item: MoveInItem) => void;
}

export const PriorityBoardView: React.FC<PriorityBoardViewProps> = ({
  items,
  onUpdatePriority,
  onOpenMarkPurchased,
  onEditItem,
}) => {
  const activeItems = items.filter((i) => i.status !== 'no_longer_needed');

  const priorityColumns: {
    key: PriorityLevel;
    title: string;
    description: string;
    icon: React.ElementType;
    headerBg: string;
    borderCol: string;
    textColor: string;
  }[] = [
    {
      key: 'critical',
      title: 'Critical',
      description: 'Must have before moving in (Day 1)',
      icon: AlertTriangle,
      headerBg: 'bg-rose-50',
      borderCol: 'border-rose-200',
      textColor: 'text-rose-800',
    },
    {
      key: 'high',
      title: 'High',
      description: 'Buy soon / during the first week',
      icon: Flame,
      headerBg: 'bg-amber-50',
      borderCol: 'border-amber-200',
      textColor: 'text-amber-800',
    },
    {
      key: 'medium',
      title: 'Medium',
      description: 'Acquire after settling in',
      icon: Clock,
      headerBg: 'bg-[#EBF4D3]/60',
      borderCol: 'border-[#BADB88]',
      textColor: 'text-[#3C4E20]',
    },
    {
      key: 'low',
      title: 'Low',
      description: 'Non-urgent / can wait',
      icon: Coffee,
      headerBg: 'bg-blue-50',
      borderCol: 'border-blue-200',
      textColor: 'text-blue-800',
    },
    {
      key: 'optional',
      title: 'Optional',
      description: 'Nice to have if budget permits',
      icon: Sparkles,
      headerBg: 'bg-gray-50',
      borderCol: 'border-gray-200',
      textColor: 'text-gray-700',
    },
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* View Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
            Priority Matrix
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#22252A] font-['Outfit'] mt-1">
          Move-In Priority Board
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Focus on Day-1 necessities first to ensure you have bedding, power, and hygiene ready on move-in night.
        </p>
      </div>

      {/* Priority Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {priorityColumns.map((col) => {
          const colItems = activeItems.filter((i) => i.priority === col.key);
          const colCost = colItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
          const unpurchasedCount = colItems.filter(
            (i) => i.status !== 'purchased' && i.status !== 'already_owned'
          ).length;
          const Icon = col.icon;

          return (
            <div
              key={col.key}
              className="bg-white rounded-3xl border border-[#E8E4D3] shadow-xs flex flex-col overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-4 border-b ${col.borderCol} ${col.headerBg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${col.textColor}`} />
                    <h3 className={`text-sm font-bold font-['Outfit'] uppercase ${col.textColor}`}>
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold bg-white/80 px-2 py-0.5 rounded-full border border-gray-200 text-[#22252A]">
                    {colItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-1 leading-tight">
                  {col.description}
                </p>
                <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                  <span className="text-[#8A909D]">Total:</span>
                  <span className="font-bold text-[#22252A]">{formatPHP(colCost)}</span>
                </div>
              </div>

              {/* Column Items */}
              <div className="p-3 space-y-2.5 min-h-[140px] max-h-[600px] overflow-y-auto">
                {colItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#8A909D]">
                    No {col.title.toLowerCase()} items
                  </div>
                ) : (
                  colItems.map((item) => {
                    const isPurchased = item.status === 'purchased' || item.status === 'already_owned';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isPurchased
                            ? 'bg-emerald-50/30 border-emerald-200 opacity-80'
                            : 'bg-[#FEFBE9]/50 border-[#E8E4D3] hover:border-[#D7E9B9]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <h4
                            onClick={() => onEditItem(item)}
                            className="text-xs font-bold text-[#22252A] font-['Outfit'] line-clamp-2 hover:underline cursor-pointer"
                          >
                            {item.name}
                          </h4>
                          {isPurchased && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-1">
                          <span>{item.store}</span>
                          <span className="font-bold text-[#22252A]">
                            {formatPHP(item.totalPrice)}
                          </span>
                        </div>

                        {/* Priority Switcher Select */}
                        <div className="mt-2 pt-2 border-t border-[#E8E4D3]/60 flex items-center justify-between">
                          <select
                            value={item.priority}
                            onChange={(e) =>
                              onUpdatePriority(item.id, e.target.value as PriorityLevel)
                            }
                            className="text-[10px] bg-white border border-[#E8E4D3] rounded-lg px-1.5 py-0.5 text-[#22252A] focus:outline-hidden"
                            title="Move item to another priority tier"
                          >
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="optional">Optional</option>
                          </select>

                          {!isPurchased && (
                            <button
                              onClick={() => onOpenMarkPurchased(item)}
                              className="text-[10px] font-semibold text-[#556B2F] hover:underline"
                            >
                              Mark got
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
