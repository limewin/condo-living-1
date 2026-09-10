import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ListTodo,
  CheckSquare,
  Columns,
  Sparkles,
  Store,
  Layers,
  DollarSign,
  CalendarDays,
  FileText,
  Building,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react';
import { MoveInItem } from '../types';

export type NavView =
  | 'dashboard'
  | 'items'
  | 'shopping'
  | 'priority'
  | 'essentials'
  | 'stores'
  | 'categories'
  | 'budget'
  | 'timeline'
  | 'notes'
  | 'condo'
  | 'settings';

interface NavigationProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  items: MoveInItem[];
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  items,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const neededItemsCount = items.filter(
    (i) => i.status !== 'purchased' && i.status !== 'already_owned' && i.status !== 'no_longer_needed'
  ).length;

  const criticalItemsCount = items.filter(
    (i) => i.priority === 'critical' && i.status !== 'purchased' && i.status !== 'already_owned'
  ).length;

  const essentialsCount = items.filter(
    (i) => i.isEssential && i.status !== 'purchased' && i.status !== 'already_owned'
  ).length;

  const navSections = [
    {
      label: 'COMMAND CENTER',
      links: [
        { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'items' as NavView, label: 'All Items', icon: ListTodo, badge: items.length },
      ],
    },
    {
      label: 'SHOPPING & EXECUTION',
      links: [
        { id: 'shopping' as NavView, label: 'Shopping Mode', icon: ShoppingBag, badge: neededItemsCount, badgeColor: 'bg-[#D7E9B9] text-[#22252A]' },
        { id: 'priority' as NavView, label: 'Priority Board', icon: Columns, badge: criticalItemsCount > 0 ? `${criticalItemsCount} crit` : undefined, badgeColor: 'bg-rose-100 text-rose-800' },
        { id: 'essentials' as NavView, label: 'Move-In Essentials', icon: Sparkles, badge: essentialsCount > 0 ? essentialsCount : undefined },
        { id: 'stores' as NavView, label: 'Stores & Platforms', icon: Store },
        { id: 'categories' as NavView, label: 'Categories', icon: Layers },
      ],
    },
    {
      label: 'LOGISTICS & CONDO',
      links: [
        { id: 'budget' as NavView, label: 'Budget & Costs', icon: DollarSign },
        { id: 'timeline' as NavView, label: 'Moving Timeline', icon: CalendarDays },
        { id: 'notes' as NavView, label: 'Notes & Reminders', icon: FileText },
        { id: 'condo' as NavView, label: 'Condo Details', icon: Building },
        { id: 'settings' as NavView, label: 'Settings & Backup', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0 bg-[#FEFBE9] border-r border-[#E8E4D3] py-5 px-3 min-h-[calc(100vh-65px)]">
        <nav className="space-y-6 flex-1 text-left">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-[10px] font-bold text-[#8A909D] tracking-wider mb-1.5 uppercase">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentView === link.id;
                  return (
                    <button
                      key={link.id}
                      id={`nav-link-${link.id}`}
                      onClick={() => onSelectView(link.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#D7E9B9] text-[#22252A] shadow-xs border border-[#BADB88]'
                          : 'text-[#4A505B] hover:bg-white/70 hover:text-[#22252A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#22252A]' : 'text-[#6B7280]'}`} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            link.badgeColor || (isActive ? 'bg-white/80 text-[#22252A]' : 'bg-[#E8E4D3] text-[#4A505B]')
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E4D3] py-2 px-3 pb-safe">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium transition-colors ${
              currentView === 'dashboard' ? 'text-[#22252A] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <div className={`p-1 rounded-xl ${currentView === 'dashboard' ? 'bg-[#D7E9B9]' : ''}`}>
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectView('items')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium transition-colors relative ${
              currentView === 'items' ? 'text-[#22252A] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <div className={`p-1 rounded-xl ${currentView === 'items' ? 'bg-[#D7E9B9]' : ''}`}>
              <ListTodo className="w-4 h-4" />
            </div>
            <span>Items</span>
          </button>

          <button
            onClick={() => onSelectView('shopping')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium transition-colors relative ${
              currentView === 'shopping' ? 'text-[#22252A] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <div className={`p-1 rounded-xl ${currentView === 'shopping' ? 'bg-[#D7E9B9]' : ''}`}>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span>Shopping</span>
            {neededItemsCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 bg-[#8EAE56] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectView('budget')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium transition-colors ${
              currentView === 'budget' ? 'text-[#22252A] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <div className={`p-1 rounded-xl ${currentView === 'budget' ? 'bg-[#D7E9B9]' : ''}`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <span>Budget</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 p-1 text-[11px] font-medium transition-colors ${
              ['priority', 'essentials', 'stores', 'categories', 'timeline', 'notes', 'condo', 'settings'].includes(
                currentView
              )
                ? 'text-[#22252A] font-bold'
                : 'text-[#6B7280]'
            }`}
          >
            <div
              className={`p-1 rounded-xl ${
                ['priority', 'essentials', 'stores', 'categories', 'timeline', 'notes', 'condo', 'settings'].includes(
                  currentView
                )
                  ? 'bg-[#D7E9B9]'
                  : ''
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <span>More</span>
          </button>
        </div>
      </div>

      {/* MOBILE MORE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FEFBE9] rounded-t-3xl p-6 shadow-2xl border-t border-[#E8E4D3] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4D3]">
              <span className="font-bold text-base text-[#22252A] font-['Outfit']">Planner Views</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-500 hover:bg-[#EAE5D2] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 grid grid-cols-2 gap-2 text-left">
              {[
                { id: 'priority' as NavView, label: 'Priority Board', icon: Columns },
                { id: 'essentials' as NavView, label: 'Move-In Essentials', icon: Sparkles },
                { id: 'stores' as NavView, label: 'Stores & Platforms', icon: Store },
                { id: 'categories' as NavView, label: 'Categories', icon: Layers },
                { id: 'timeline' as NavView, label: 'Moving Timeline', icon: CalendarDays },
                { id: 'notes' as NavView, label: 'Notes & Reminders', icon: FileText },
                { id: 'condo' as NavView, label: 'Condo Details', icon: Building },
                { id: 'settings' as NavView, label: 'Settings & Backup', icon: Settings },
              ].map((m) => {
                const Icon = m.icon;
                const active = currentView === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectView(m.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-[#D7E9B9] text-[#22252A] border-[#BADB88]'
                        : 'bg-white text-[#4A505B] border-[#E8E4D3]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#556B2F]" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
