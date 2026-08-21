'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useAccount } from 'wagmi';
import { Award, CheckCircle2, Lock, Sparkles, User, ExternalLink, QrCode } from 'lucide-react';
import Link from 'next/link';

function PassportPageInner() {
  const { address, isConnected } = useAccount();

  const sampleCredentials = [
    {
      id: 'EDU-2026-9283',
      degree: 'B.Tech Computer Science & AI',
      institution: 'Verified University (UGC Accredited)',
      issuedAt: '2026-06-15',
      cgpaProof: 'CGPA >= 8.0 (Proven: TRUE ✓)',
      actualCgpa: '8.47',
      credits: 142,
      status: 'ACTIVE',
      commitment: '0x91af8123bc4567890abcdef1234567890abcdef1234567890abcdef123456789',
    },
    {
      id: 'EDU-2026-4401',
      degree: 'Advanced Machine Learning Certification',
      institution: 'IIT AI Research Lab',
      issuedAt: '2026-02-10',
      cgpaProof: 'Grade >= A (Proven: TRUE ✓)',
      actualCgpa: 'Grade A+',
      credits: 12,
      status: 'ACTIVE',
      commitment: '0x71ba9876fc543210fedcba0987654321fedcba0987654321fedcba0987654321',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F7F3] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="bg-[#113221] text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#E85D34]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-[#E85D34] flex items-center justify-center text-white shadow-lg shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl md:text-3xl font-montserrat font-bold">
                      Academic Passport
                    </h1>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-montserrat font-bold px-3 py-1 rounded-full uppercase">
                      Student Owned
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-300 mt-1">
                    Wallet Anchor: {isConnected && address ? address : 'Not Connected (Connect wallet in header)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/verify"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-montserrat text-xs font-semibold px-5 py-3 rounded-full transition-colors flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4 text-[#E85D34]" />
                  <span>Verify Portal</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#113221]/10 flex items-center space-x-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-xs font-inter text-[#113221]/80">
              <strong className="font-montserrat font-bold text-[#113221] block text-sm mb-0.5">
                "Prove, Don't Reveal" Privacy Principle
              </strong>
              Your full transcript and raw grades remain stored safely in your private wallet. Third-party verifiers receive only on-chain cryptographic commitment proofs.
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-montserrat font-bold text-[#113221] flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#E85D34]" />
              <span>Verifiable Academic Credentials ({sampleCredentials.length})</span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {sampleCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-[#113221]/10 hover:border-[#E85D34]/30 transition-all duration-300 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <span className="font-mono text-xs text-[#E85D34] font-bold">
                        {cred.id}
                      </span>
                      <h3 className="text-xl font-montserrat font-bold text-[#113221] mt-0.5">
                        {cred.degree}
                      </h3>
                      <p className="text-xs font-inter text-gray-600 mt-1">
                        Issued by: <strong>{cred.institution}</strong> • {cred.issuedAt}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-montserrat font-bold px-3 py-1.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ON-CHAIN ACTIVE</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#113221]/5 rounded-2xl p-4 border border-[#113221]/10 space-y-2">
                      <span className="text-[10px] font-montserrat font-bold uppercase text-gray-500 block">
                        Zero-Knowledge Proof Preview
                      </span>
                      <div className="text-sm font-montserrat font-bold text-[#113221] flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#E85D34]" />
                        <span>{cred.cgpaProof}</span>
                      </div>
                      <p className="text-[11px] font-inter text-gray-500">
                        Actual Grade ({cred.actualCgpa}) is masked from third parties.
                      </p>
                    </div>

                    <div className="bg-[#113221]/5 rounded-2xl p-4 border border-[#113221]/10 space-y-2 font-mono text-xs">
                      <span className="text-[10px] font-montserrat font-bold uppercase text-gray-500 block font-sans">
                        On-Chain Commitment Hash
                      </span>
                      <p className="break-all text-[#113221] font-bold text-[11px]">
                        {cred.commitment}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-montserrat pt-2">
                    <span className="text-gray-500 font-inter">
                      Total Credits: <strong>{cred.credits}</strong>
                    </span>
                    <Link
                      href={`/verify?id=${cred.id}`}
                      className="text-[#E85D34] hover:underline font-semibold flex items-center space-x-1"
                    >
                      <span>Verify Status</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

export default function PassportPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#F8F7F3] pt-32 pb-24 px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-12 shadow-xl border border-[#113221]/10 min-h-[400px] animate-pulse" />
        </main>
      </>
    );
  }

  return <PassportPageInner />;
}
