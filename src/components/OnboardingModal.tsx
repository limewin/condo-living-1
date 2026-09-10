import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Building2, Wallet, ArrowRight, Sparkles, X } from 'lucide-react';
import { updateUserSettings, updateCondoDetails } from '../firebase/firestoreService';
import { CondoDetails, UserSettings } from '../types';

export interface OnboardingModalProps {
  isOpen?: boolean;
  userId?: string;
  initialDetails?: CondoDetails | null;
  initialSettings?: UserSettings | null;
  onClose?: () => void;
  onComplete?: () => void;
  onSave?: (
    details: Partial<CondoDetails>,
    budget?: { moveInBudget?: number; monthlyBudget?: number }
  ) => Promise<void> | void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen = true,
  userId,
  initialDetails,
  initialSettings,
  onClose,
  onComplete,
  onSave,
}) => {
  if (!isOpen) return null;

  const [condoName, setCondoName] = useState(initialDetails?.condoName || '');
  const [moveInDate, setMoveInDate] = useState(initialDetails?.moveInDate || '');
  const [moveInBudget, setMoveInBudget] = useState(
    initialSettings?.moveInBudget ? String(initialSettings.moveInBudget) : '20000'
  );
  const [monthlyBudget, setMonthlyBudget] = useState(
    initialSettings?.monthlyBudget ? String(initialSettings.monthlyBudget) : '8000'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDetails?.condoName && !condoName) {
      setCondoName(initialDetails.condoName);
    }
    if (initialDetails?.moveInDate && !moveInDate) {
      setMoveInDate(initialDetails.moveInDate);
    }
    if (initialSettings?.moveInBudget && moveInBudget === '20000') {
      setMoveInBudget(String(initialSettings.moveInBudget));
    }
    if (initialSettings?.monthlyBudget && monthlyBudget === '8000') {
      setMonthlyBudget(String(initialSettings.monthlyBudget));
    }
  }, [initialDetails, initialSettings]);

  const closeDialog = () => {
    if (typeof onComplete === 'function') {
      onComplete();
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleFinish = async (skip = false) => {
    setIsSubmitting(true);
    try {
      const parsedMoveInBudget = parseFloat(moveInBudget) || 20000;
      const parsedMonthlyBudget = parseFloat(monthlyBudget) || 8000;

      const condoUpdates: Partial<CondoDetails> = {
        isOnboardingCompleted: true,
        ...(condoName.trim() ? { condoName: condoName.trim() } : {}),
        ...(moveInDate ? { moveInDate } : {}),
      };

      const budgetUpdates = {
        moveInBudget: parsedMoveInBudget,
        monthlyBudget: parsedMonthlyBudget,
      };

      if (onSave) {
        await onSave(condoUpdates, !skip ? budgetUpdates : undefined);
      } else if (userId) {
        if (!skip) {
          await updateCondoDetails(userId, condoUpdates);
          await updateUserSettings(userId, {
            ...budgetUpdates,
            hasCompletedOnboarding: true,
          });
        } else {
          await updateCondoDetails(userId, { isOnboardingCompleted: true });
          await updateUserSettings(userId, { hasCompletedOnboarding: true });
        }
      }
    } catch (e) {
      console.error('Error saving onboarding data:', e);
    } finally {
      setIsSubmitting(false);
      closeDialog();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#FEFBE9] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E8E4D3] text-left animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Optional top close button */}
        <button
          onClick={closeDialog}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#6B7280] hover:text-[#22252A] hover:bg-[#EBF4D3] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#556B2F] mb-1 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Quick Welcome Setup</span>
        </div>
        <h2 className="text-2xl font-bold text-[#22252A] font-['Outfit'] mb-1">
          Let’s set up your move.
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mb-6 leading-relaxed">
          Set your initial targets for your condo move. Everything is optional and can be adjusted at any time.
        </p>

        <div className="space-y-4">
          {/* Condo Name */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#556B2F]" />
              Condo / Residence Name
            </label>
            <input
              type="text"
              value={condoName}
              onChange={(e) => setCondoName(e.target.value)}
              placeholder="e.g. One Eastwood Avenue, Grass Residences, Studio 7"
              className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3.5 py-2.5 text-sm text-[#22252A] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#BADB88] focus:ring-1 focus:ring-[#BADB88]"
            />
          </div>

          {/* Move-in Date */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#556B2F]" />
              Target Move-In Date
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full bg-white border border-[#E8E4D3] rounded-xl px-3.5 py-2.5 text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88] focus:ring-1 focus:ring-[#BADB88]"
            />
          </div>

          {/* Two column budgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#556B2F]" />
                Move-In Budget (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">
                  ₱
                </span>
                <input
                  type="number"
                  value={moveInBudget}
                  onChange={(e) => setMoveInBudget(e.target.value)}
                  placeholder="20000"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#E8E4D3] rounded-xl text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88] focus:ring-1 focus:ring-[#BADB88]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3139] mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#556B2F]" />
                Monthly Rent / Utilities (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280]">
                  ₱
                </span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="8000"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#E8E4D3] rounded-xl text-sm text-[#22252A] focus:outline-hidden focus:border-[#BADB88] focus:ring-1 focus:ring-[#BADB88]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E8E4D3]">
          <button
            id="onboarding-skip-btn"
            type="button"
            onClick={() => handleFinish(true)}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs font-semibold text-[#6B7280] hover:text-[#22252A] py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Skip for now
          </button>

          <button
            id="onboarding-start-btn"
            type="button"
            onClick={() => handleFinish(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D7E9B9] hover:bg-[#C5DF9E] text-[#22252A] font-semibold py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer border border-[#BADB88] text-sm"
          >
            <span>{isSubmitting ? 'Saving...' : 'Start Planning'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
