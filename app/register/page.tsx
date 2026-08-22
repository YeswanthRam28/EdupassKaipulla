'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth/context';
import { PUBLIC_ROLES, getDashboardForRole } from '@/lib/auth/roles';
import { PublicUserRole } from '@/lib/auth/types';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<PublicUserRole>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await register({
        full_name: fullName,
        email,
        password,
        role,
      });
      const targetDashboard = getDashboardForRole(newUser.role);
      router.push(targetDashboard);
    } catch (err: any) {
      setError(err.message || 'Could not register user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-lg bg-[#E2E1DC] border-2 border-[#131313] p-8 md:p-12 space-y-8">
          
          {/* Header */}
          <div className="border-b border-[#131313] pb-6 space-y-2">
            <span className="text-xs font-bold text-[#FF5C00] uppercase tracking-widest block">
              [ NEW ACCOUNT ]
            </span>
            <h1 className="font-anton text-3xl md:text-4xl uppercase text-[#131313] tracking-tight">
              CREATE YOUR EDUPASS ACCOUNT
            </h1>
            <p className="text-xs uppercase text-[#333333]">
              Join the decentralized academic trust layer.
            </p>
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
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@university.edu"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                PASSWORD (MIN 8 CHARS)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00]"
              />
            </div>

            {/* Account Type Selector (ADMIN HIDDEN) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                ACCOUNT TYPE
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as PublicUserRole)}
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase cursor-pointer"
              >
                {PUBLIC_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label} — {r.description}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="border-t border-[#131313] pt-6 text-center text-xs uppercase space-y-2">
            <span className="text-[#6B7280] block">ALREADY HAVE AN ACCOUNT?</span>
            <Link
              href="/login"
              className="font-bold text-[#131313] hover:text-[#FF5C00] transition-colors underline block"
            >
              SIGN IN ↗
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
