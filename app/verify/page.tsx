'use client';

import Header from '@/components/Header';
import VerifyCredentialCard from '@/components/web3/VerifyCredentialCard';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#EAE9E4] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16">
        <VerifyCredentialCard />
      </main>
    </div>
  );
}
