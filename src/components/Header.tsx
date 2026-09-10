import React, { useState, useRef, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  Home,
  Plus,
  LogOut,
  Sparkles,
  ChevronDown,
  Building,
  CheckCircle2,
  Calendar,
  Settings,
} from 'lucide-react';
import { SaveStatus, MoveInItem, CondoDetails } from '../types';
import { SaveStatusIndicator, useOnlineStatus } from './SaveStatusIndicator';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  user: User;
  items: MoveInItem[];
  condoDetails: CondoDetails | null;
  saveStatus: SaveStatus;
  onOpenAddItem: () => void;
  onNavigateSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  items,
  condoDetails,
  saveStatus,
  onOpenAddItem,
  onNavigateSettings,
}) => {
  const isOnline = useOnlineStatus();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = items.length;
  const purchasedOrOwned = items.filter(
    (i) => i.status === 'purchased' || i.status === 'already_owned'
  ).length;
  const progressPercent = totalItems > 0 ? Math.round((purchasedOrOwned / totalItems) * 100) : 0;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FEFBE9]/95 backdrop-blur-md border-b border-[#E8E4D3] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Condo Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#D7E9B9] flex items-center justify-center shadow-xs border border-[#BADB88] shrink-0">
            <Home className="w-5 h-5 text-[#22252A]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#22252A] font-['Outfit'] tracking-tight truncate">
                {condoDetails?.condoName || 'Condo Move-In Planner'}
              </h1>
              {condoDetails?.unit && (
                <span className="hidden md:inline-block text-[11px] font-semibold text-[#556B2F] bg-[#EBF4D3] px-2 py-0.5 rounded-md border border-[#D7E9B9]">
                  {condoDetails.unit}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span className="hidden sm:inline">Move-in progress:</span>
              <span className="font-semibold text-[#22252A]">
                {purchasedOrOwned}/{totalItems} items ({progressPercent}%)
              </span>
              <div className="w-14 sm:w-20 h-1.5 bg-[#E8E4D3] rounded-full overflow-hidden inline-block">
                <div
                  className="h-full bg-[#8EAE56] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sync / Save Status Indicator */}
          <div className="hidden sm:block">
            <SaveStatusIndicator status={saveStatus} isOnline={isOnline} />
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Quick Add Item Button */}
          <button
            id="quick-add-item-btn"
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all border border-[#BADB88] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* User Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-profile-menu-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[#E8E4D3] bg-white hover:bg-[#FEFBE9] transition-colors cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-[#D7E9B9]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#D7E9B9] flex items-center justify-center text-xs font-bold text-[#22252A]">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E4D3] py-2 text-left z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-[#E8E4D3]/70">
                  <p className="text-xs font-bold text-[#22252A] truncate">
                    {user.displayName || 'Condo Planner User'}
                  </p>
                  <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigateSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#2D3139] hover:bg-[#FEFBE9] transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#556B2F]" />
                    <span>Planner Settings & Backup</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#E8E4D3]/70">
                  <button
                    id="sign-out-btn"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
