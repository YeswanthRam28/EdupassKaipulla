'use client';

import Header from '@/components/Header';
import VerifyCredentialCard from '@/components/web3/VerifyCredentialCard';

export default function VerifyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F7F3] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <span className="text-xs font-montserrat font-bold uppercase tracking-widest text-[#E85D34]">
            Trust Verification
          </span>
          <h1 className="text-3xl md:text-5xl font-montserrat font-bold text-[#113221] mt-2">
            Verify Academic Credential
          </h1>
          <p className="mt-4 text-base font-inter text-[#113221]/70 max-w-2xl mx-auto">
            Universities, employers, and embassies can verify credential authenticity, active status, and commitment hashes in seconds without contacting the issuer.
          </p>
        </div>

        <VerifyCredentialCard />
      </main>
    </>
  );
}
