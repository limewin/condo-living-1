import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { Home, CheckCircle2, ShoppingBag, DollarSign, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onSignInSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const errObj = err as { code?: string; message?: string };
      if (errObj.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please try again.');
      } else if (errObj.code === 'auth/popup-blocked') {
        setErrorMessage('Browser popup blocked. Please allow popups for this site or open in a new tab.');
      } else {
        setErrorMessage(errObj.message || 'Unable to sign in with Google. Please check connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFBE9] flex flex-col justify-between selection:bg-[#D7E9B9]">
      {/* Top Brand Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-[#E8E4D3]/70 bg-[#FEFBE9]/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D7E9B9] flex items-center justify-center shadow-xs border border-[#BADB88]">
            <Home className="w-5 h-5 text-[#22252A]" />
          </div>
          <span className="font-bold text-lg text-[#22252A] tracking-tight">Condo Move-In Planner</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5E6470] font-medium bg-[#EBF4D3]/50 px-3 py-1.5 rounded-full border border-[#D7E9B9]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-[#556B2F]" />
          <span>Cloud Saved & Isolated</span>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#E8E4D3] text-center">
            {/* Center Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FEFBE9] border border-[#D7E9B9] flex items-center justify-center mb-6 shadow-xs">
              <Home className="w-8 h-8 text-[#2D3139]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#22252A] tracking-tight mb-2 font-['Outfit']">
              Condo Move-In Planner
            </h1>
            <p className="text-[#6B7280] text-sm sm:text-base mb-8">
              Plan it. Budget it. Move in ready.
            </p>

            {/* Value props list */}
            <div className="bg-[#FEFBE9] rounded-2xl p-4 mb-8 text-left space-y-3 border border-[#E8E4D3]/80">
              <div className="flex items-center gap-3 text-xs text-[#4A505B]">
                <div className="w-6 h-6 rounded-lg bg-[#D7E9B9] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#22252A]" />
                </div>
                <span>Curated shopping list across Shopee, TikTok Shop & Lazada</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#4A505B]">
                <div className="w-6 h-6 rounded-lg bg-[#D7E9B9] flex items-center justify-center shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-[#22252A]" />
                </div>
                <span>PHP (₱) budget manager with planned vs actual spending</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#4A505B]">
                <div className="w-6 h-6 rounded-lg bg-[#D7E9B9] flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5 text-[#22252A]" />
                </div>
                <span>Upper-bunk & shared condo essentials with offline sync</span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
                {errorMessage}
              </div>
            )}

            {/* Primary Google Login Button */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#D7E9B9] hover:bg-[#C5DF9E] text-[#22252A] font-semibold py-3.5 px-6 rounded-2xl shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer text-sm sm:text-base border border-[#BADB88]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#22252A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-[#22252A]/70" />
            </button>

            <p className="mt-4 text-xs text-[#8A909D]">
              Your condo planning data stays completely isolated and encrypted in your personal Firestore account.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#8A909D] border-t border-[#E8E4D3]/60">
        Condo Move-In Planner • Seamless move-in shopping & budget command center
      </footer>
    </div>
  );
};
