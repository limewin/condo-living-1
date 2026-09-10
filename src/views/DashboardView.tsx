import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  Calendar,
  Layers,
  Store,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { MoveInItem, UserSettings, CondoDetails } from '../types';
import { formatPHP } from '../utils/currency';
import { NavView } from '../components/Navigation';

interface DashboardViewProps {
  items: MoveInItem[];
  settings: UserSettings | null;
  condoDetails: CondoDetails | null;
  onOpenAddItem: () => void;
  onOpenMarkPurchased: (item: MoveInItem) => void;
  onNavigate: (view: NavView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  settings,
  condoDetails,
  onOpenAddItem,
  onOpenMarkPurchased,
  onNavigate,
}) => {
  // Filter active items (excluding no_longer_needed)
  const activeItems = items.filter((i) => i.status !== 'no_longer_needed');
  const purchasedItems = activeItems.filter(
    (i) => i.status === 'purchased' || i.status === 'already_owned'
  );
  const neededItems = activeItems.filter(
    (i) => i.status !== 'purchased' && i.status !== 'already_owned'
  );

  // Financial Calculations
  const totalEstimatedCost = activeItems.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const totalPurchasedCost = purchasedItems.reduce(
    (acc, curr) => acc + (curr.actualPricePaid ?? curr.totalPrice ?? 0),
    0
  );
  const remainingEstimatedCost = neededItems.reduce(
    (acc, curr) => acc + (curr.totalPrice || 0),
    0
  );

  const budget = settings?.moveInBudget || 25000;
  const totalProjectedSpent = totalPurchasedCost + remainingEstimatedCost;
  const budgetVariance = budget - totalProjectedSpent;
  const isOverBudget = budgetVariance < 0;

  // Readiness
  const readinessPercent =
    activeItems.length > 0 ? Math.round((purchasedItems.length / activeItems.length) * 100) : 0;

  // Critical items needed
  const criticalNeeded = neededItems
    .filter((i) => i.priority === 'critical')
    .slice(0, 5);

  // Spending by Store for Recharts
  const storeMap: Record<string, { store: string; total: number; count: number }> = {};
  activeItems.forEach((i) => {
    const sName = i.store || 'Unassigned';
    if (!storeMap[sName]) storeMap[sName] = { store: sName, total: 0, count: 0 };
    storeMap[sName].total += i.totalPrice;
    storeMap[sName].count += 1;
  });
  const storeData = Object.values(storeMap).sort((a, b) => b.total - a.total).slice(0, 6);

  // Spending by Category for Recharts
  const catMap: Record<string, { name: string; total: number }> = {};
  activeItems.forEach((i) => {
    const cName = i.category || 'Other';
    if (!catMap[cName]) catMap[cName] = { name: cName, total: 0 };
    catMap[cName].total += i.totalPrice;
  });
  const categoryData = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 6);

  const CHART_COLORS = ['#8EAE56', '#D7E9B9', '#B5D580', '#6F8C3D', '#E0ECD5', '#3C4E20'];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Banner / Move-In Countdown & Budget Status */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Move-In Command Center
            </span>
            {condoDetails?.moveInDate && (
              <span className="text-xs font-semibold text-[#6B7280] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Target: {new Date(condoDetails.moveInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit']">
            {readinessPercent >= 100
              ? 'Everything is ready for move-in day!'
              : `${readinessPercent}% of your condo essentials are secured`}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {neededItems.length} items left to purchase across {storeData.length} stores.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('shopping')}
            className="flex items-center gap-2 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors border border-[#BADB88] cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Open Shopping Mode</span>
          </button>
          <button
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 bg-white hover:bg-[#FEFBE9] text-[#22252A] font-semibold px-3.5 py-2 rounded-xl text-xs border border-[#E8E4D3] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#556B2F]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Estimated Cost */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E4D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B7280]">Total Estimated</span>
            <div className="w-7 h-7 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#556B2F]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit']">
            {formatPHP(totalEstimatedCost)}
          </p>
          <p className="text-[11px] text-[#8A909D] mt-1">Across all planned items</p>
        </div>

        {/* Total Purchased / Spent */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E4D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B7280]">Total Spent</span>
            <div className="w-7 h-7 rounded-xl bg-[#EBF4D3] border border-[#BADB88] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#3C4E20]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit']">
            {formatPHP(totalPurchasedCost)}
          </p>
          <p className="text-[11px] text-[#8A909D] mt-1">
            {purchasedItems.length} items acquired
          </p>
        </div>

        {/* Remaining to Spend */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E4D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B7280]">Remaining Cost</span>
            <div className="w-7 h-7 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#556B2F]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit']">
            {formatPHP(remainingEstimatedCost)}
          </p>
          <p className="text-[11px] text-[#8A909D] mt-1">
            {neededItems.length} items left to buy
          </p>
        </div>

        {/* Budget Health */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E4D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6B7280]">Budget Status</span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-[#EBF4D3] text-[#3C4E20]'
              }`}
            >
              {isOverBudget ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold font-['Outfit'] ${
              isOverBudget ? 'text-rose-600' : 'text-[#22252A]'
            }`}
          >
            {isOverBudget
              ? `Over ${formatPHP(Math.abs(budgetVariance))}`
              : `${formatPHP(budgetVariance)} left`}
          </p>
          <p className="text-[11px] text-[#8A909D] mt-1">
            Cap: {formatPHP(budget)}
          </p>
        </div>
      </div>

      {/* TWO COLUMN CONTENT: CRITICAL ITEMS + STORE SPENDING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Items Remaining */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                    Critical Items Remaining
                  </h3>
                  <p className="text-xs text-[#6B7280]">Must have ready before move-in day</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('priority')}
                className="text-xs font-semibold text-[#556B2F] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {criticalNeeded.length === 0 ? (
              <div className="py-8 text-center bg-[#FEFBE9]/50 rounded-2xl border border-[#E8E4D3]/70">
                <CheckCircle2 className="w-8 h-8 text-[#8EAE56] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#22252A]">All critical items secured!</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Great job! You have no pending critical items.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {criticalNeeded.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FEFBE9]/60 border border-[#E8E4D3] hover:border-[#D7E9B9] transition-all"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#22252A] truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-md">
                          CRITICAL
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                        <span>{item.store}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#22252A]">
                          {formatPHP(item.totalPrice)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenMarkPurchased(item)}
                      className="shrink-0 bg-white hover:bg-[#D7E9B9] text-[#22252A] font-semibold text-xs px-3 py-1.5 rounded-xl border border-[#E8E4D3] transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#E8E4D3]/70 flex items-center justify-between text-xs text-[#6B7280]">
            <span>{neededItems.filter((i) => i.priority === 'critical').length} total critical items</span>
            <button
              onClick={() => onNavigate('essentials')}
              className="text-[#556B2F] font-semibold hover:underline"
            >
              See Essentials Checklist
            </button>
          </div>
        </div>

        {/* Spending by Store Chart */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EBF4D3] flex items-center justify-center text-[#3C4E20]">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                    Estimated Spending by Store
                  </h3>
                  <p className="text-xs text-[#6B7280]">Shopee, TikTok Shop, Lazada & Physical</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('stores')}
                className="text-xs font-semibold text-[#556B2F] hover:underline flex items-center gap-1"
              >
                <span>Store View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {storeData.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">
                No items added yet to graph spending.
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="store"
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(val: number | undefined) => [formatPHP(val || 0), 'Total']}
                      contentStyle={{
                        backgroundColor: '#FEFBE9',
                        borderColor: '#BADB88',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                      {storeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E4D3]/70 flex items-center justify-between text-xs text-[#6B7280]">
            <span>{storeData.length} shopping destinations</span>
            <button
              onClick={() => onNavigate('shopping')}
              className="text-[#556B2F] font-semibold hover:underline"
            >
              Shop by Store
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN ROW */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
                Condo Category Allocation
              </h3>
              <p className="text-xs text-[#6B7280]">
                Sleeping, Organization, Bathroom, Electronics & Laundry
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-semibold text-[#556B2F] hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categoryData.map((cat, idx) => {
            const pct = totalEstimatedCost > 0 ? Math.round((cat.total / totalEstimatedCost) * 100) : 0;
            return (
              <div
                key={cat.name}
                className="p-3.5 rounded-2xl bg-[#FEFBE9]/50 border border-[#E8E4D3] text-left hover:border-[#BADB88] transition-colors"
              >
                <span className="text-[11px] font-semibold text-[#6B7280] block truncate">
                  {cat.name}
                </span>
                <span className="text-sm font-bold text-[#22252A] font-['Outfit'] block mt-1">
                  {formatPHP(cat.total)}
                </span>
                <div className="w-full h-1 bg-[#E8E4D3] rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#8A909D] block mt-1">{pct}% of total</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
