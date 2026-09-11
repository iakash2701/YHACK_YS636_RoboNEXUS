import React, { useState } from 'react';
import { Shield, Key, UserCheck, Lock, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface OperatorProfile {
  callsign: string;
  role: string;
  clearanceLevel: string;
  badgeId: string;
  authProvider?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (profile: OperatorProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [callsign, setCallsign] = useState('COMMANDER-ALPHA');
  const [pin, setPin] = useState('2026');
  const [role, setRole] = useState('Flight Director (Full Override)');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) {
      setError('Operator Call Sign is required');
      return;
    }
    setError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess({
        callsign: callsign.toUpperCase(),
        role,
        clearanceLevel: 'LEVEL 5 - TOP SECRET',
        badgeId: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        authProvider: 'MANUAL'
      });
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess({
        callsign: 'FLIGHT-DIRECTOR-01',
        role: 'Autonomous Systems Flight Director',
        clearanceLevel: 'LEVEL 5 - HACKATHON DEMO',
        badgeId: 'OP-7749',
        authProvider: 'DEMO'
      });
    }, 400);
  };

  const handleGoogleLogin = () => {
    setError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess({
        callsign: 'OPERATOR (GOOGLE SSO)',
        role: 'Autonomous Flight Specialist (Google Authenticated)',
        clearanceLevel: 'LEVEL 5 - OAUTH SECURE',
        badgeId: 'GOOG-9921',
        authProvider: 'GOOGLE'
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 font-mono text-xs">
      {/* Background Animated Grid Lines */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="glass-panel-glow rounded-2xl max-w-md w-full p-6 md:p-8 relative border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 z-10">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 animate-pulse">
              <Shield className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full text-slate-950 border border-slate-900">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
              RoboNexus Mission Control
            </h2>
            <p className="text-[11px] text-cyan-400/90 font-sans tracking-wide mt-0.5">
              Tactical Airspace & Autonomous Fleet Portal
            </p>
          </div>
        </div>

        {/* 1-Click Quick Demo Login Badge */}
        <div className="mb-5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px]">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>HACKATHON 1-CLICK DEMO ACCESS</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              FAST PASS
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isAuthenticating}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-md hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <span>Launch as Flight Director</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Google SSO Login Option */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isAuthenticating}
          className="w-full mb-4 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2.5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">or authenticate manually</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-300 text-[11px]">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Operator Call Sign
            </label>
            <div className="relative">
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="e.g. COMMANDER-ALPHA"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-cyan-200 font-mono text-xs outline-none transition"
              />
              <UserCheck className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Access PIN / Token
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-cyan-200 font-mono text-xs outline-none transition"
              />
              <Key className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Security Role Clearance
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-lg px-3.5 py-2 text-slate-200 font-mono text-xs outline-none transition"
            >
              <option value="Autonomous Systems Flight Director">Flight Director (Full Autonomous Override)</option>
              <option value="Autonomous Systems Safety Officer">Safety Officer (Battery & Charging Control)</option>
              <option value="AI Risk Engine Specialist">AI Risk Specialist (ML Diagnostics)</option>
              <option value="Hackathon Judge / Guest Observer">Hackathon Observer / Guest</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold transition flex items-center justify-center gap-2 mt-2"
          >
            {isAuthenticating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Verifying Security Clearance...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Authenticate & Unlock Terminal</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-500 font-sans border-t border-slate-900 pt-3">
          Self-Learning Risk-Aware Autonomous Mission Control Center • Encryption: AES-256
        </div>
      </div>
    </div>
  );
};
