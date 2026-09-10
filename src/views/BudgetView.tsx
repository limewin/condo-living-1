import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { MoveInItem, UserSettings } from '../types';
import { formatPHP } from '../utils/currency';

interface BudgetViewProps {
  items: MoveInItem[];
  settings: UserSettings | null;
  onUpdateBudget: (moveInBudget: number, monthlyBudget: number) => Promise<void>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  items,
  settings,
  onUpdateBudget,
}) => {
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);
  const [moveInBudgetInput, setMoveInBudgetInput] = useState(
    settings?.moveInBudget?.toString() || '25000'
  );
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(
    settings?.monthlyBudget?.toString() || '8000'
  );
  const [isSaving, setIsSaving] = useState(false);

  const activeItems = items.filter((i) => i.status !== 'no_longer_needed');
  const purchasedItems = activeItems.filter(
    (i) => i.status === 'purchased' || i.status === 'already_owned'
  );
  const pendingItems = activeItems.filter(
    (i) => i.status !== 'purchased' && i.status !== 'already_owned'
  );

  const totalPlannedSpend = activeItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalActualSpend = purchasedItems.reduce(
    (sum, i) => sum + (i.actualPricePaid ?? i.totalPrice),
    0
  );
  const remainingNeededSpend = pendingItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const totalProjectedFinalSpend = totalActualSpend + remainingNeededSpend;

  const currentBudget = settings?.moveInBudget || 25000;
  const currentMonthly = settings?.monthlyBudget || 8000;

  const budgetDifference = currentBudget - totalProjectedFinalSpend;
  const isOverBudget = budgetDifference < 0;
  const budgetUtilizationPercent =
    currentBudget > 0 ? Math.min(100, Math.round((totalProjectedFinalSpend / currentBudget) * 100)) : 0;

  // Comparison of items with actual vs estimated difference
  const varianceItems = purchasedItems.filter(
    (i) => i.actualPricePaid !== undefined && i.actualPricePaid !== i.totalPrice
  );

  const handleSaveBudget = async () => {
    setIsSaving(true);
    try {
      await onUpdateBudget(
        Math.max(0, parseFloat(moveInBudgetInput) || 0),
        Math.max(0, parseFloat(monthlyBudgetInput) || 0)
      );
      setIsEditingBudgets(false);
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Banner with Edit Budget Option */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Philippine Peso (₱) Budget
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
            Move-In Budget & Variance
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor planned vs actual purchases in real-time to avoid surprise move-in expenses.
          </p>
        </div>

        <button
          onClick={() => setIsEditingBudgets(!isEditingBudgets)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FEFBE9] border border-[#D7E9B9] hover:bg-[#D7E9B9] text-xs font-semibold text-[#2D3139] transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#556B2F]" />
          <span>{isEditingBudgets ? 'Close Editor' : 'Adjust Budget Caps'}</span>
        </button>
      </div>

      {/* Budget Edit Drawer */}
      {isEditingBudgets && (
        <div className="bg-[#FEFBE9] rounded-3xl p-5 border border-[#BADB88] shadow-xs animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-[#22252A] font-['Outfit'] mb-3">
            Set Budget Caps (₱)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1">
                Move-In Shopping Budget (One-time)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">₱</span>
                <input
                  type="number"
                  value={moveInBudgetInput}
                  onChange={(e) => setMoveInBudgetInput(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#E8E4D3] rounded-xl text-sm font-semibold text-[#22252A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1">
                Monthly Rent / Living Budget (Recurring)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">₱</span>
                <input
                  type="number"
                  value={monthlyBudgetInput}
                  onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#E8E4D3] rounded-xl text-sm font-semibold text-[#22252A]"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsEditingBudgets(false)}
              className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBudget}
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold text-xs px-4 py-2 rounded-xl border border-[#BADB88]"
            >
              <Check className="w-4 h-4" />
              <span>Update Caps</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Allocated Budget */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B7280]">Total Budget Cap</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#22252A] font-['Outfit']">
            {formatPHP(currentBudget)}
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] mb-1">
              <span>Utilized: {formatPHP(totalProjectedFinalSpend)}</span>
              <span className="font-bold">{budgetUtilizationPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[#E8E4D3] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-rose-500' : 'bg-[#8EAE56]'
                }`}
                style={{ width: `${Math.min(100, budgetUtilizationPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Spent to Date */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E4D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B7280]">Actual Spent to Date</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF4D3] border border-[#BADB88] flex items-center justify-center text-[#3C4E20]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#22252A] font-['Outfit']">
            {formatPHP(totalActualSpend)}
          </p>
          <p className="text-xs text-[#6B7280] mt-3">
            {purchasedItems.length} items purchased ({pendingItems.length} remaining)
          </p>
        </div>

        {/* Budget Health / Variance */}
        <div
          className={`rounded-3xl p-5 border shadow-xs ${
            isOverBudget
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-[#EBF4D3]/60 border-[#BADB88] text-[#22252A]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isOverBudget ? 'Over Budget' : 'Under Budget'}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isOverBudget ? 'bg-rose-200 text-rose-800' : 'bg-[#D7E9B9] text-[#22252A]'
              }`}
            >
              {isOverBudget ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
          </div>
          <p className="text-2xl font-bold font-['Outfit']">
            {formatPHP(Math.abs(budgetDifference))}
          </p>
          <p className="text-xs mt-3 opacity-80">
            {isOverBudget
              ? `Exceeding target cap by ${formatPHP(Math.abs(budgetDifference))}`
              : `Safe headroom of ${formatPHP(budgetDifference)} remaining`}
          </p>
        </div>
      </div>

      {/* Item-by-Item Price Variance Comparison */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs">
        <h3 className="text-base font-bold text-[#22252A] font-['Outfit'] mb-1">
          Estimated vs Actual Price Comparisons
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Items where you saved money with vouchers or spent more than anticipated.
        </p>

        {purchasedItems.length === 0 ? (
          <div className="p-8 text-center bg-[#FEFBE9]/50 rounded-2xl border border-[#E8E4D3] text-xs text-[#6B7280]">
            No purchased items yet to compare pricing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E4D3] text-[#8A909D] font-semibold">
                  <th className="pb-2.5">Item Name</th>
                  <th className="pb-2.5">Store Used</th>
                  <th className="pb-2.5 text-right">Estimated</th>
                  <th className="pb-2.5 text-right">Actual Paid</th>
                  <th className="pb-2.5 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4D3]/50">
                {purchasedItems.map((item) => {
                  const actual = item.actualPricePaid ?? item.totalPrice;
                  const variance = actual - item.totalPrice;
                  const isSaved = variance < 0;
                  const isExtra = variance > 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#FEFBE9]/40 transition-colors">
                      <td className="py-3 font-semibold text-[#22252A]">{item.name}</td>
                      <td className="py-3 text-[#6B7280]">{item.store}</td>
                      <td className="py-3 text-right font-medium text-gray-500">
                        {formatPHP(item.totalPrice)}
                      </td>
                      <td className="py-3 text-right font-bold text-[#22252A]">
                        {formatPHP(actual)}
                      </td>
                      <td className="py-3 text-right font-bold">
                        {isSaved && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Saved {formatPHP(Math.abs(variance))}
                          </span>
                        )}
                        {isExtra && (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            +{formatPHP(variance)}
                          </span>
                        )}
                        {!isSaved && !isExtra && (
                          <span className="text-gray-400 font-normal">Exact</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
