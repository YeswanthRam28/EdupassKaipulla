'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth/context';
import { getDashboardForRole } from '@/lib/auth/roles';
import ConnectWallet from '@/components/web3/ConnectWallet';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({ email, password });
      const targetDashboard = getDashboardForRole(authenticatedUser.role);
      router.push(targetDashboard);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-md bg-[#E2E1DC] border-2 border-[#131313] p-8 md:p-12 space-y-8">
          
          {/* Header */}
          <div className="border-b border-[#131313] pb-6 space-y-2">
            <span className="text-xs font-bold text-[#FF5C00] uppercase tracking-widest block">
              [ AUTHENTICATION ]
            </span>
            <h1 className="font-anton text-4xl uppercase text-[#131313] tracking-tight">
              EDUPASS
            </h1>
            <p className="text-xs uppercase text-[#333333]">
              Welcome back. Sign in with Web3 wallet or password.
            </p>
          </div>

          {/* Web3 Wallet Sign-In Button */}
          <div className="bg-[#EAE9E4] border border-[#131313] p-4 text-center space-y-3">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              WEB3 WALLET FAST AUTHENTICATION
            </span>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[#6B7280] uppercase font-bold">
            <div className="flex-1 h-px bg-[#131313]/30" />
            <span>OR SIGN IN WITH EMAIL</span>
            <div className="flex-1 h-px bg-[#131313]/30" />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-mono uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'SIGNING IN...' : 'SIGN IN WITH EMAIL'}</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="border-t border-[#131313] pt-6 text-center text-xs uppercase space-y-2">
            <span className="text-[#6B7280] block">DON&apos;T HAVE AN ACCOUNT?</span>
            <Link
              href="/register"
              className="font-bold text-[#131313] hover:text-[#FF5C00] transition-colors underline block"
            >
              CREATE ACADEMIC PASSPORT ↗
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
