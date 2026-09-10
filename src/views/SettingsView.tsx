import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Smartphone,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  MoveInItem,
  CondoDetails,
  UserSettings,
  ItemCategory,
  StorePlatform,
  MoveInNote,
} from '../types';

interface SettingsViewProps {
  user: User;
  items: MoveInItem[];
  condoDetails: CondoDetails | null;
  settings: UserSettings | null;
  categories: ItemCategory[];
  stores: StorePlatform[];
  notes: MoveInNote[];
  onImportData: (data: any) => Promise<void>;
  onResetData: () => Promise<void>;
  onLoadDemoData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  items,
  condoDetails,
  settings,
  categories,
  stores,
  notes,
  onImportData,
  onResetData,
  onLoadDemoData,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // JSON Export Handler
  const handleExportJSON = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      app: 'Condo Move-In Planner',
      version: '1.0.0',
      userId: user.uid,
      condoDetails,
      settings,
      items,
      categories,
      stores,
      notes,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `condo-movein-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // JSON Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || (!parsed.items && !parsed.condoDetails)) {
          throw new Error('Invalid backup file structure.');
        }
        await onImportData(parsed);
        setImportSuccess(true);
      } catch (err: any) {
        setImportError(err.message || 'Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onResetData();
      setShowResetConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await onLoadDemoData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4D3] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#556B2F] uppercase tracking-wider bg-[#EBF4D3] px-2.5 py-0.5 rounded-full border border-[#D7E9B9]">
            System & Cloud Sync
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#22252A] font-['Outfit'] mt-1">
          Planner Settings & Backup
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Your inventory and notes are persistently bound to your Google account in Firebase Firestore.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E4D3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-12 h-12 rounded-2xl object-cover border border-[#D7E9B9]"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#D7E9B9] flex items-center justify-center font-bold text-base text-[#22252A]">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
              {user.displayName || 'Condo Planner Member'}
            </h3>
            <p className="text-xs text-[#6B7280]">{user.email}</p>
            <span className="inline-block text-[10px] font-semibold text-[#556B2F] bg-[#EBF4D3] px-2 py-0.5 rounded-md mt-1">
              Authoritative Firestore Account Active
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Backup & Export Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E4D3] shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#22252A] font-['Outfit'] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#556B2F]" />
            <span>Data Export & Backup (JSON)</span>
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Download your full condo shopping list, photos, budget, and notes to a JSON file.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-[#D7E9B9] hover:bg-[#C2DE9B] text-[#22252A] font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-xs border border-[#BADB88] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (.json)</span>
          </button>

          <label className="flex items-center gap-2 bg-white hover:bg-[#FEFBE9] text-[#22252A] font-semibold px-4 py-2.5 rounded-2xl text-xs border border-[#E8E4D3] transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-[#556B2F]" />
            <span>Restore Backup (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {importSuccess && (
          <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            Backup successfully restored to Firestore!
          </p>
        )}
        {importError && (
          <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-200">
            {importError}
          </p>
        )}
      </div>

      {/* Demo Data & Reset Actions */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E4D3] shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#22252A] font-['Outfit']">
            Demo & Factory Management
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Load sample condo items or wipe your database to start completely fresh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDemo}
            disabled={isLoadingDemo}
            className="flex items-center gap-2 bg-white hover:bg-[#FEFBE9] text-[#22252A] font-semibold px-4 py-2.5 rounded-2xl text-xs border border-[#E8E4D3] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#556B2F] ${isLoadingDemo ? 'animate-spin' : ''}`} />
            <span>Load Curated Condo Demo Pack</span>
          </button>

          {showResetConfirm ? (
            <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-2xl border border-rose-200">
              <span className="text-xs font-bold text-rose-700">Wipe all your items?</span>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs text-gray-600 hover:text-black px-2 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-2xl text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Wipe & Reset Database</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
