'use client';

import Link from 'next/link';
import ConnectWallet from './web3/ConnectWallet';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6">
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-3xl font-playfair font-bold tracking-tight text-[#113221] hover:opacity-80 transition-opacity">
          EduPass.
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-montserrat font-medium text-[#113221]/80">
          <Link href="/issue" className="hover:text-[#E85D34] transition-colors">
            Issue Credential
          </Link>
          <Link href="/passport" className="hover:text-[#E85D34] transition-colors">
            Academic Passport
          </Link>
          <Link href="/verify" className="hover:text-[#E85D34] transition-colors">
            Verify Portal
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <ConnectWallet />
      </div>
    </header>
  );
}
