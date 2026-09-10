import React, { useState } from 'react';
import {
  Building,
  Calendar,
  Phone,
  Clock,
  MapPin,
  DollarSign,
  ShieldCheck,
  Edit2,
  Check,
  User,
} from 'lucide-react';
import { CondoDetails } from '../types';
import { formatPHP } from '../utils/currency';

interface CondoDetailsViewProps {
  condoDetails: CondoDetails | null;
  onUpdateCondoDetails: (details: Partial<CondoDetails>) => Promise<void>;
}

export const CondoDetailsView: React.FC<CondoDetailsViewProps> = ({
  condoDetails,
  onUpdateCondoDetails,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [condoName, setCondoName] = useState(condoDetails?.condoName || '');
  const [tower, setTower] = useState(condoDetails?.tower || '');
  const [unit, setUnit] = useState(condoDetails?.unit || '');
  const [moveInDate, setMoveInDate] = useState(condoDetails?.moveInDate || '');
  const [monthlyRentShare, setMonthlyRentShare] = useState(
    condoDetails?.monthlyRentShare?.toString() || ''
  );
  const [adminContact, setAdminContact] = useState(condoDetails?.adminContact || '');
  const [guardContact, setGuardContact] = useState(condoDetails?.guardContact || '');
  const [officeHours, setOfficeHours] = useState(condoDetails?.officeHours || '');
  const [rulesNotes, setRulesNotes] = useState(condoDetails?.rulesNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate days remaining
  let daysRemaining: number | null = null;
  if (condoDetails?.moveInDate) {
    const target = new Date(condoDetails.moveInDate).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCondoDetails({
        condoName: condoName.trim() || 'My Condo',
        tower: tower.trim() || undefined,
        unit: unit.trim() || undefined,
        moveInDate: moveInDate || undefined,
        monthlyRentShare: monthlyRentShare ? parseFloat(monthlyRentShare) : undefined,
        adminContact: adminContact.trim() || undefined,
        guardContact: guardContact.trim() || undefined,
        officeHours: officeHours.trim() || undefined,
        rulesNotes: rulesNotes.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving condo details:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
              Property & Unit Info
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
            {condoDetails?.condoName || 'Condo Property Details'}
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Key reference card for unit number, tower, admin contact numbers, and move-in schedule.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FEFBE9] border border-[#D7E9B9] hover:bg-[#D7E9B9] text-xs font-semibold text-[#2D3139] transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#556B2F]" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-[#BADB88] shadow-xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">Edit Condo Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Condo / Building Name *</label>
              <input
                type="text"
                value={condoName}
                onChange={(e) => setCondoName(e.target.value)}
                placeholder="e.g. Grass Residences, SMDC Light"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Tower / Phase</label>
              <input
                type="text"
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                placeholder="e.g. Tower 3"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Floor & Unit Number</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit 2415"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Target Move-In Date</label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Monthly Rent Share (₱)</label>
              <input
                type="number"
                value={monthlyRentShare}
                onChange={(e) => setMonthlyRentShare(e.target.value)}
                placeholder="e.g. 7500"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Admin Office Contact Number</label>
              <input
                type="text"
                value={adminContact}
                onChange={(e) => setAdminContact(e.target.value)}
                placeholder="e.g. (02) 8888-1234 or mobile"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Guard Lobby / Intercom Number</label>
              <input
                type="text"
                value={guardContact}
                onChange={(e) => setGuardContact(e.target.value)}
                placeholder="e.g. Local 101 or 0917-xxx-xxxx"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3139] mb-1">Property Office Hours</label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                placeholder="e.g. Mon-Sat 9:00 AM - 5:00 PM"
                className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl px-3 py-2 text-[#22252A] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2D3139] mb-1">Admin Move-In Notes & Guidelines</label>
            <textarea
              rows={3}
              value={rulesNotes}
              onChange={(e) => setRulesNotes(e.target.value)}
              placeholder="e.g. Service elevator must be booked 3 days in advance. Gate pass required for vehicles taller than 2.1m."
              className="w-full bg-[#FEFBE9]/50 border border-[#E8E4D3] rounded-xl p-3 text-[#22252A] focus:outline-hidden"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E4D3]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-5 py-2 rounded-xl border border-[#BADB88]"
            >
              <Check className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E4D3] shadow-xs space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Property
                </span>
                <h3 className="text-2xl font-bold text-[#22252A] font-['Outfit']">
                  {condoDetails?.condoName || 'My Shared Condo'}
                </h3>
                <p className="text-sm text-[#556B2F] font-semibold mt-0.5">
                  {condoDetails?.tower || 'Main Tower'} • {condoDetails?.unit || 'Unit Not Set'}
                </p>
              </div>

              {daysRemaining !== null && (
                <div className="text-right bg-[#FEFBE9] px-4 py-2.5 rounded-2xl border border-[#D7E9B9]">
                  <span className="text-[10px] font-bold text-[#8A909D] uppercase block">Countdown</span>
                  <span className="text-xl font-bold text-[#22252A] font-['Outfit']">
                    {daysRemaining > 0
                      ? `${daysRemaining} days left`
                      : daysRemaining === 0
                      ? 'Move-In Day!'
                      : 'Moved in!'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E4D3]/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#6B7280] block">Admin Office</span>
                  <span className="text-xs font-bold text-[#22252A]">
                    {condoDetails?.adminContact || 'None listed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#6B7280] block">Guard Lobby Contact</span>
                  <span className="text-xs font-bold text-[#22252A]">
                    {condoDetails?.guardContact || 'None listed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#6B7280] block">Admin Hours</span>
                  <span className="text-xs font-bold text-[#22252A]">
                    {condoDetails?.officeHours || 'Mon - Sat 9AM - 5PM'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center text-[#556B2F]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#6B7280] block">Monthly Rent Share</span>
                  <span className="text-xs font-bold text-[#22252A]">
                    {condoDetails?.monthlyRentShare ? formatPHP(condoDetails.monthlyRentShare) : '₱0'}
                  </span>
                </div>
              </div>
            </div>

            {condoDetails?.rulesNotes && (
              <div className="p-4 bg-[#FEFBE9]/60 rounded-2xl border border-[#E8E4D3] text-xs">
                <span className="font-bold text-[#22252A] block mb-1">Move-In Policy & Rules:</span>
                <p className="text-[#4A505B] whitespace-pre-line leading-relaxed">
                  {condoDetails.rulesNotes}
                </p>
              </div>
            )}
          </div>

          {/* Quick Move-In Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E4D3] shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#22252A] font-['Outfit'] mb-3">
                Pre-Move Protocol
              </h4>
              <div className="space-y-2.5 text-xs text-[#2D3139]">
                <div className="flex items-start gap-2">
                  <span className="text-[#556B2F] font-bold">1.</span>
                  <span>Reserve service elevator with property management.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#556B2F] font-bold">2.</span>
                  <span>Obtain Move-In Gate Pass for hauling truck / van.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#556B2F] font-bold">3.</span>
                  <span>Submit valid IDs of movers/helpers to security lobby.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#556B2F] font-bold">4.</span>
                  <span>Pay security deposit & move-in inspection fee.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4D3]/70 text-[11px] text-[#8A909D]">
              Always check with building admin at least 3 business days prior.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
