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
    <div className="min-h-screen bg-[#EAE9E4] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 relative overflow-hidden font-mono">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313] shrink-0 font-bold">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl md:text-4xl font-archivo font-bold uppercase tracking-tight">
                      Academic Passport
                    </h1>
                    <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-mono font-bold px-3 py-1 uppercase">
                      Student Owned
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-300 mt-1 uppercase">
                    WALLET ANCHOR: {isConnected && address ? address : 'NOT CONNECTED (CONNECT WALLET IN HEADER)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/verify"
                  className="bg-[#FF5C00] text-[#131313] hover:bg-white font-mono text-xs font-bold uppercase px-5 py-3 border border-[#131313] transition-colors flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>VERIFY PORTAL ↗</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-[#E2E2E2] border border-[#131313] p-6 flex items-center space-x-4 font-mono text-xs">
            <div className="w-10 h-10 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313] shrink-0 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div className="uppercase leading-relaxed">
              <strong className="font-archivo font-bold text-sm block mb-0.5 text-[#131313]">
                "PROVE, DON&apos;T REVEAL" PRIVACY PRINCIPLE
              </strong>
              Your full transcript and raw grades remain stored safely in your private wallet. Third-party verifiers receive only on-chain cryptographic commitment proofs.
            </div>
          </div>

          {/* Credentials List */}
          <div className="space-y-6">
            <h2 className="text-xl font-archivo font-bold uppercase text-[#131313] flex items-center space-x-2 border-b border-[#131313] pb-4">
              <Award className="w-5 h-5 text-[#FF5C00]" />
              <span>Verifiable Academic Credentials ({sampleCredentials.length})</span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {sampleCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="bg-[#E2E2E2] border-2 border-[#131313] p-6 md:p-8 space-y-6 font-mono"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#131313] pb-4">
                    <div>
                      <span className="font-mono text-xs text-[#FF5C00] font-bold">
                        {cred.id}
                      </span>
                      <h3 className="text-xl md:text-2xl font-archivo font-bold uppercase text-[#131313] mt-0.5">
                        {cred.degree}
                      </h3>
                      <p className="text-xs uppercase text-[#333333] mt-1">
                        ISSUED BY: <strong>{cred.institution}</strong> • {cred.issuedAt}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-[#131313] text-white text-xs font-mono font-bold px-3 py-1.5 border border-[#131313] uppercase flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5C00]" />
                        <span>ON-CHAIN ACTIVE</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280] block">
                        ZERO-KNOWLEDGE PROOF PREVIEW
                      </span>
                      <div className="text-xs font-mono font-bold text-[#131313] flex items-center space-x-2 uppercase">
                        <Sparkles className="w-4 h-4 text-[#FF5C00]" />
                        <span>{cred.cgpaProof}</span>
                      </div>
                      <p className="text-[11px] uppercase text-[#6B7280]">
                        Actual Grade ({cred.actualCgpa}) is masked from third parties.
                      </p>
                    </div>

                    <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-2 font-mono text-xs">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280] block">
                        ON-CHAIN COMMITMENT HASH
                      </span>
                      <p className="break-all text-[#FF5C00] font-bold text-[11px]">
                        {cred.commitment}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-[#131313]">
                    <span className="uppercase text-[#333333]">
                      TOTAL CREDITS: <strong>{cred.credits}</strong>
                    </span>
                    <Link
                      href={`/verify?id=${cred.id}`}
                      className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black px-4 py-2 text-xs font-bold uppercase border border-[#131313] transition-colors flex items-center space-x-1"
                    >
                      <span>VERIFY STATUS</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PassportPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#EAE9E4]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16">
          <div className="max-w-4xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-12 min-h-[400px] animate-pulse" />
        </main>
      </div>
    );
  }

  return <PassportPageInner />;
}
