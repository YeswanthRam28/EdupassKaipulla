'use client';

import Link from 'next/link';
import ConnectWallet from './web3/ConnectWallet';

export default function Header() {
  return (
    <header className="w-full bg-[#EAE9E4] border-b border-[#333333] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="font-anton text-2xl md:text-3xl tracking-tight text-[#131313] hover:text-[#FF5C00] transition-colors flex items-center gap-2"
        >
          <span>EDUPASS</span>
          <span className="text-[#FF5C00]">•</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-medium uppercase tracking-wider text-[#131313]">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">
            ABOUT
          </Link>
          <Link href="/issue" className="hover:text-[#FF5C00] transition-colors">
            ISSUE
          </Link>
          <Link href="/verify" className="hover:text-[#FF5C00] transition-colors">
            VERIFY
          </Link>
          <Link href="/passport" className="hover:text-[#FF5C00] transition-colors">
            PASSPORT
          </Link>
        </nav>

        {/* Wallet Connector */}
        <div className="flex items-center gap-4">
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
