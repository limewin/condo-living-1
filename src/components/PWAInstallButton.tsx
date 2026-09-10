import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-[#D7E9B9] px-3 py-1.5 text-xs font-semibold text-[#22252A] shadow-xs hover:bg-[#C2DE9B] transition-colors active:scale-95"
        title="Install Condo Move-In Planner app on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#D7E9B9] bg-white/80 px-2.5 py-1.5 text-xs font-medium text-[#22252A] hover:bg-[#FEFBE9] transition-colors"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#556B2F]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#FEFBE9] p-6 shadow-xl border border-[#E8E4D3]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D3]">
                <h3 className="text-base font-bold text-[#22252A]">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-gray-500 hover:bg-[#EAE5D2] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-[#4A505B] leading-relaxed">
                1. Tap the <strong className="text-[#22252A]">Share</strong> button (box with arrow) at the bottom of Safari.<br />
                2. Scroll down and tap <strong className="text-[#22252A]">Add to Home Screen</strong>.<br />
                3. Tap <strong className="text-[#22252A]">Add</strong> to enjoy full offline access!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#D7E9B9] py-2.5 text-sm font-semibold text-[#22252A] hover:bg-[#C2DE9B] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
