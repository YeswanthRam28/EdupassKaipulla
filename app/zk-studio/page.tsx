'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { ZKClaim, generateZKProof, ZKProofPackage } from '@/lib/zk/zkEngine';
import { ShieldCheck, Lock, Award, Copy, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PRESET_CLAIMS: ZKClaim[] = [
  {
    type: 'MIN_CGPA',
    label: 'PROVE CGPA >= 3.0 / 4.0 (OR >= 7.5 / 10.0)',
    threshold: 7.5,
    description: 'Proves academic eligibility above 7.5 CGPA without exposing your exact GPA.',
  },
  {
    type: 'MIN_CGPA',
    label: 'PROVE HIGH ACADEMIC HONORS (CGPA >= 8.5)',
    threshold: 8.5,
    description: 'Proves high academic performance above 8.5 CGPA to top employers & universities.',
  },
  {
    type: 'MIN_CREDITS',
    label: 'PROVE COMPLETED DEGREE CREDITS (>= 120 UNITS)',
    threshold: 120,
    description: 'Proves degree completion credit requirements without disclosing transcript details.',
  },
  {
    type: 'DEGREE_VERIFIED',
    label: 'PROVE ACCREDITED DEGREE HOLDER STATUS',
    threshold: 1,
    description: 'Proves holding a verified university degree without disclosing your student ID or name.',
  },
];

function ZKStudioContent() {
  const { user, token } = useAuth();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCred, setSelectedCred] = useState<any | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ZKClaim>(PRESET_CLAIMS[0]);
  const [generatedPackage, setGeneratedPackage] = useState<ZKProofPackage | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch student credentials
  useEffect(() => {
    async function fetchMyCredentials() {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/credentials/my-passport`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCredentials(data);
          if (data.length > 0) setSelectedCred(data[0]);
        }
      } catch (err) {
        console.error('Error fetching credentials for ZK Studio:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyCredentials();
  }, [token]);

  const handleGenerateProof = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedPackage(null);

    if (!selectedCred) {
      setError('Please select a credential from your Academic Passport first.');
      return;
    }

    try {
      const zkPkg = generateZKProof(selectedCred, selectedClaim);
      setGeneratedPackage(zkPkg);
    } catch (err: any) {
      setError(err.message || 'Error generating zero-knowledge proof.');
    }
  };

  const copyProofPackage = () => {
    if (!generatedPackage) return;
    navigator.clipboard.writeText(JSON.stringify(generatedPackage, null, 2));
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-10">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-xs font-bold text-[#FF5C00] uppercase tracking-widest block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5C00]" />
                [ ZERO-KNOWLEDGE PROOF STUDIO ]
              </span>
              <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white mt-1">
                GENERATE ZERO-KNOWLEDGE PROOFS
              </h1>
            </div>

            <span className="bg-[#FF5C00] text-[#131313] text-xs font-bold px-3 py-1 uppercase border border-[#131313] hidden sm:inline-block">
              GROTH16 / SELECTIVE DISCLOSURE
            </span>
          </div>

          <p className="text-xs uppercase text-gray-300 max-w-2xl leading-relaxed">
            Generate mathematical zero-knowledge eligibility proofs from your credentials. Disclose specific academic claims (e.g. <code>CGPA &gt;= 8.0</code>) without revealing your transcript details or personal identity.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center text-xs font-bold uppercase animate-pulse">
            LOADING ACADEMIC PASSPORT CREDENTIALS...
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center space-y-4">
            <Award className="w-10 h-10 text-[#FF5C00] mx-auto" />
            <h2 className="font-anton text-2xl uppercase text-[#131313]">NO CREDENTIALS AVAILABLE FOR PROOF GENERATION</h2>
            <p className="text-xs uppercase text-gray-600 max-w-md mx-auto">
              Ask your institution to issue your verified degree credential first to generate zero-knowledge proofs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column */}
            <form onSubmit={handleGenerateProof} className="lg:col-span-7 bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-8">
              
              {/* Step 1: Select Credential */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                  1. SELECT ACADEMIC PASSPORT CREDENTIAL *
                </label>
                
                <div className="space-y-2">
                  {credentials.map((cred) => {
                    const isSelected = selectedCred?.id === cred.id;
                    return (
                      <div
                        key={cred.id}
                        onClick={() => setSelectedCred(cred)}
                        className={`p-4 border-2 transition-all cursor-pointer flex justify-between items-center ${
                          isSelected 
                            ? 'bg-[#131313] text-white border-[#131313]' 
                            : 'bg-[#EAE9E4] text-[#131313] border-[#131313] hover:border-[#FF5C00]'
                        }`}
                      >
                        <div>
                          <span className={`font-archivo font-bold text-sm uppercase block ${isSelected ? 'text-[#FF5C00]' : 'text-[#131313]'}`}>
                            {cred.degree}
                          </span>
                          <span className={`text-[10px] uppercase ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                            STUDENT ID: {cred.student_id} • CGPA: {cred.cgpa} • CREDITS: {cred.credits}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#FF5C00]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Claim */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                  2. SELECT ZERO-KNOWLEDGE PROOF CLAIM (WHAT YOU WANT TO PROVE) *
                </label>

                <div className="space-y-2">
                  {PRESET_CLAIMS.map((claim, idx) => {
                    const isSelected = selectedClaim.label === claim.label;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedClaim(claim)}
                        className={`p-4 border-2 transition-all cursor-pointer flex justify-between items-start gap-3 ${
                          isSelected 
                            ? 'bg-[#131313] text-white border-[#131313]' 
                            : 'bg-[#EAE9E4] text-[#131313] border-[#131313] hover:border-[#FF5C00]'
                        }`}
                      >
                        <div>
                          <span className={`font-mono font-bold text-xs uppercase block ${isSelected ? 'text-[#FF5C00]' : 'text-[#131313]'}`}>
                            {claim.label}
                          </span>
                          <span className={`text-[10px] uppercase leading-relaxed ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                            {claim.description}
                          </span>
                        </div>
                        {isSelected && <Lock className="w-4 h-4 text-[#FF5C00] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-bold uppercase bg-red-100 p-3 border border-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FF5C00]" />
                <span>GENERATE ZERO-KNOWLEDGE PROOF PACKAGE</span>
              </button>

            </form>

            {/* Results Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {generatedPackage ? (
                <div className="bg-[#131313] text-white border-2 border-[#131313] p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <div className="flex items-center gap-2 text-[#FF5C00] font-bold text-xs uppercase">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5C00]" />
                      <span>ZK PROOF GENERATED</span>
                    </div>
                    <span className="text-[9px] bg-[#FF5C00] text-[#131313] font-bold px-2 py-0.5 uppercase">
                      {generatedPackage.zk_version}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase">DISCLOSED PROOF CLAIM:</span>
                      <p className="font-bold text-[#FF5C00] uppercase mt-0.5">{generatedPackage.proof_description}</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-1">
                      <span className="text-gray-400 text-[9px] block uppercase font-bold">ZK PROOF SIGNATURE:</span>
                      <p className="font-mono text-[10px] text-white break-all">{generatedPackage.proof_signature}</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-1">
                      <span className="text-gray-400 text-[9px] block uppercase font-bold">PUBLIC INPUT COMMITMENT HASH:</span>
                      <p className="font-mono text-[10px] text-[#FF5C00] break-all">{generatedPackage.public_inputs.commitment_hash}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-700">
                    <button
                      onClick={copyProofPackage}
                      className="w-full bg-[#FF5C00] hover:bg-white text-[#131313] font-mono font-bold text-xs uppercase py-3 border border-[#131313] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedProof ? 'COPIED ZK PACKAGE!' : 'COPY ZK PROOF PACKAGE (JSON)'}</span>
                    </button>

                    <Link
                      href="/verify"
                      className="w-full bg-[#222222] hover:bg-gray-800 text-white font-mono font-bold text-xs uppercase py-3 border border-gray-700 transition-colors flex items-center justify-center gap-2 block text-center"
                    >
                      <span>TEST ON VERIFIER PORTAL</span>
                      <ArrowRight className="w-4 h-4 text-[#FF5C00]" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-[#E2E1DC] border-2 border-[#131313] p-8 text-center space-y-4 font-mono">
                  <ShieldCheck className="w-10 h-10 text-[#FF5C00] mx-auto" />
                  <h3 className="font-archivo font-bold text-lg uppercase text-[#131313]">PROOF OUTPUT PREVIEW</h3>
                  <p className="text-xs uppercase text-gray-600 leading-relaxed">
                    Select a credential and claim on the left to generate an exportable zero-knowledge proof package.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default function ZKStudioPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <ZKStudioContent />
    </ProtectedRoute>
  );
}
