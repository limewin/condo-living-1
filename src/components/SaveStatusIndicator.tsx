import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2, RefreshCw, Cloud } from 'lucide-react';
import { SaveStatus } from '../types';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  isOnline: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, isOnline }) => {
  if (!isOnline) {
    return (
      <div 
        id="save-status-offline"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
        title="Changes are saved to your local storage and will sync automatically once reconnected."
      >
        <WifiOff className="w-3 h-3 text-amber-600 animate-pulse" />
        <span>Offline — saved locally</span>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div 
        id="save-status-saving"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEFBE9] border border-[#D7E9B9] text-[#556B2F] text-xs font-medium"
      >
        <RefreshCw className="w-3 h-3 animate-spin text-[#7C9940]" />
        <span>Saving…</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div 
        id="save-status-error"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
      >
        <Cloud className="w-3 h-3" />
        <span>Sync issue — retrying…</span>
      </div>
    );
  }

  // Saved / Synced
  return (
    <div 
      id="save-status-saved"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF4D3]/60 border border-[#D7E9B9]/70 text-[#3C4E20] text-xs font-medium"
      title="All changes synced to your Google account"
    >
      <CheckCircle2 className="w-3 h-3 text-[#5F8029]" />
      <span>Synced</span>
    </div>
  );
};

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
