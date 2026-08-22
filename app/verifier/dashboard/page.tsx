'use client';

import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { Search, LogOut } from 'lucide-react';
import Link from 'next/link';

function VerifierDashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                VERIFIER ROLE
              </span>
              <span className="text-xs uppercase text-gray-400">ID: {user?.id}</span>
            </div>
            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              VERIFICATION PORTAL
            </h1>
            <p className="text-xs uppercase text-gray-300">
              AUTHENTICATED VERIFIER: <strong>{user?.full_name}</strong> ({user?.email})
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono font-bold text-xs uppercase px-6 py-3 border border-[#131313] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        </div>

        {/* Module Content Placeholder */}
        <div className="bg-[#E2E1DC] border-2 border-[#131313] p-8 md:p-16 text-center space-y-6">
          <div className="w-16 h-16 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313] mx-auto font-bold">
            <Search className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#FF5C00] uppercase tracking-widest block">
              [ VERIFIER PORTAL ]
            </span>
            <h2 className="font-archivo font-bold text-2xl md:text-3xl uppercase text-[#131313]">
              Credential verification tools will appear here.
            </h2>
            <p className="text-xs uppercase leading-relaxed text-[#333333]">
              Future capabilities: Query on-chain smart contract commitments, verify off-chain JSON transcript hashes, and evaluate zero-knowledge proof proofs.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/verify"
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-6 py-3 border border-[#131313] transition-colors"
            >
              OPEN VERIFY PORTAL ↗
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function VerifierDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['VERIFIER']}>
      <VerifierDashboardContent />
    </ProtectedRoute>
  );
}
