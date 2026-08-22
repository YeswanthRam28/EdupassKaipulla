'use client';

import Link from 'next/link';
import ConnectWallet from './web3/ConnectWallet';
import { useAuth } from '@/lib/auth/context';

export default function Header() {
  const { user } = useAuth();
  const isIssuerRole = user?.role === 'INSTITUTION' || user?.role === 'EMPLOYER' || user?.role === 'ADMIN';

  return (
    <header className="w-full bg-[#E5E4DF] border-b border-[#131313] sticky top-0 z-50">
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-10 py-4 relative">
        
        {/* Left: + EDUPASS */}
        <Link 
          href="/" 
          className="font-mono text-sm font-bold tracking-wider text-[#131313] hover:text-[#FF5C00] transition-colors flex items-center gap-1.5 uppercase"
        >
          <span className="text-base font-normal">+</span>
          <span>EDUPASS</span>
        </Link>
        
        {/* Center: + Crosshair */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-[#131313] text-lg font-light select-none">
          +
        </div>

        {/* Right Navigation & Unified Wallet Login */}
        <div className="flex items-center gap-6 font-mono text-xs font-semibold uppercase tracking-wider text-[#131313]">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/security" className="hover:text-[#FF5C00] transition-colors font-bold text-[#FF5C00]">
              SECURITY
            </Link>
            <Link href="/ai-agent" className="hover:text-[#FF5C00] transition-colors">
              AI AGENT
            </Link>
            <Link href="/mobility" className="hover:text-[#FF5C00] transition-colors">
              MOBILITY
            </Link>
            <Link href="/student/resume" className="hover:text-[#FF5C00] transition-colors">
              RESUME
            </Link>
            <Link href="/zk-studio" className="hover:text-[#FF5C00] transition-colors">
              ZK STUDIO
            </Link>
            <Link href="/student/consent" className="hover:text-[#FF5C00] transition-colors">
              CONSENT
            </Link>
            <Link href="/verify" className="hover:text-[#FF5C00] transition-colors">
              VERIFIER
            </Link>

            {/* Issuance tab strictly for Institutions, Employers & Admins */}
            {isIssuerRole && (
              <Link href="/issue" className="hover:text-[#FF5C00] transition-colors font-bold text-[#FF5C00]">
                ISSUANCE
              </Link>
            )}

            <Link href="/dashboard" className="hover:text-[#FF5C00] transition-colors flex items-center gap-1.5">
              <span>DASHBOARD</span>
              <span className="w-2.5 h-2.5 bg-[#FF5C00] inline-block" />
            </Link>
          </nav>

          {/* Unified Web3 Wallet Connect & Login */}
          <ConnectWallet />

          <span className="hidden sm:inline text-base font-light text-[#131313]">+</span>
        </div>

      </div>
    </header>
  );
}
