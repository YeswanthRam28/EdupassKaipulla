'use client';

import Header from '@/components/Header';
import IssueCredentialForm from '@/components/web3/IssueCredentialForm';

export default function IssuePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F7F3] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <span className="text-xs font-montserrat font-bold uppercase tracking-widest text-[#E85D34]">
            Institution Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-montserrat font-bold text-[#113221] mt-2">
            Issue On-Chain Academic Credential
          </h1>
          <p className="mt-4 text-base font-inter text-[#113221]/70 max-w-2xl mx-auto">
            Anchor cryptographically verifiable academic credentials on the EVM trust layer. Sensitive student data remains private off-chain.
          </p>
        </div>

        <IssueCredentialForm />
      </main>
    </>
  );
}
