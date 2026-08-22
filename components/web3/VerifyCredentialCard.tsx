'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { CREDENTIAL_REGISTRY_ADDRESS, CREDENTIAL_REGISTRY_ABI } from '@/web3/contracts';
import { verifyZKProofPackage } from '@/lib/zk/zkEngine';
import { Search, ShieldAlert, CheckCircle2, XCircle, Key, Sparkles, FileText, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function VerifyCredentialCardInner() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'HASH' | 'ZK'>('HASH');
  
  const [searchId, setSearchId] = useState('EDU-2026-0687');
  const [backendCredential, setBackendCredential] = useState<any | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // ZK Verification State
  const [zkPackageInput, setZkPackageInput] = useState('');
  const [zkVerificationResult, setZkVerificationResult] = useState<{ isValid: boolean; message: string } | null>(null);

  const [queryCredentialIdBytes32, setQueryCredentialIdBytes32] = useState<`0x${string}` | null>(null);
  
  const { data: credentialData } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'getCredential',
    args: queryCredentialIdBytes32 ? [queryCredentialIdBytes32] : undefined,
    query: {
      enabled: !!queryCredentialIdBytes32,
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setBackendError(null);
    setBackendCredential(null);
    setBackendLoading(true);

    const term = searchId.trim();

    try {
      let res;
      if (term.startsWith('0x') && term.length >= 40) {
        res = await fetch(`${API_BASE}/credentials/verify/${encodeURIComponent(term)}`);
      } else {
        res = await fetch(`${API_BASE}/credentials/student/${encodeURIComponent(term)}`);
      }

      if (!res.ok) {
        throw new Error(`No verified credential matching "${term}" was found.`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length === 0) {
          setBackendError(`No verified credentials found for Student ID "${term}".`);
        } else {
          setBackendCredential(data[0]);
        }
      } else {
        setBackendCredential(data);
      }
    } catch (err: any) {
      setBackendError(err.message || 'Error querying verification registry.');
    } finally {
      setBackendLoading(false);
    }

    if (term.startsWith('0x') && term.length === 66) {
      setQueryCredentialIdBytes32(term as `0x${string}`);
    } else {
      setQueryCredentialIdBytes32(keccak256(stringToBytes(term)));
    }
  };

  const handleVerifyZkProof = () => {
    setZkVerificationResult(null);
    if (!zkPackageInput.trim()) return;

    try {
      const parsed = JSON.parse(zkPackageInput.trim());
      const res = verifyZKProofPackage(parsed);
      setZkVerificationResult(res);
    } catch (e: any) {
      setZkVerificationResult({
        isValid: false,
        message: 'Invalid JSON format. Please paste a valid ZK Proof Package JSON exported from the ZK Studio.',
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-8 md:p-12 space-y-8 font-mono">
      {/* Title */}
      <div className="flex items-center gap-4 border-b border-[#131313] pb-6">
        <div className="w-12 h-12 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313] font-bold">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5C00] uppercase block">
            [ PUBLIC VERIFIER PORTAL ]
          </span>
          <h2 className="text-2xl md:text-3xl font-archivo font-bold uppercase text-[#131313]">
            Credential & ZK Verification Portal
          </h2>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-2 border-[#131313] bg-[#EAE9E4]">
        <button
          onClick={() => setActiveTab('HASH')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'HASH'
              ? 'bg-[#131313] text-white'
              : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#FF5C00]" />
          <span>COMMITMENT & TRANSCRIPT VERIFICATION</span>
        </button>

        <button
          onClick={() => setActiveTab('ZK')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ZK'
              ? 'bg-[#131313] text-white'
              : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FF5C00]" />
          <span>ZERO-KNOWLEDGE PROOF VERIFIER</span>
        </button>
      </div>

      {/* TAB 1: COMMITMENT VERIFICATION */}
      {activeTab === 'HASH' && (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Student ID (e.g. EDU-2026-0687) or Commitment Hash (0x...)"
              required
              className="flex-1 bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
            />
            <button
              type="submit"
              disabled={backendLoading}
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest px-8 py-3.5 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50"
            >
              {backendLoading ? 'VERIFYING...' : 'VERIFY COMMITMENT'}
            </button>
          </form>

          {backendError && (
            <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-mono uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{backendError}</span>
            </div>
          )}

          {backendCredential && (
            <div className="space-y-6">
              <div className={`p-6 border flex items-center justify-between gap-4 font-mono ${
                backendCredential.is_revoked ? 'bg-red-100 border-red-500 text-red-900' : 'bg-[#131313] text-white border-[#131313]'
              }`}>
                <div className="flex items-center space-x-3">
                  {backendCredential.is_revoked ? (
                    <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-[#FF5C00] shrink-0" />
                  )}
                  <div>
                    <h3 className="font-archivo font-bold text-lg uppercase">
                      {backendCredential.is_revoked ? 'REVOKED CREDENTIAL' : 'AUTHENTIC & VERIFIED CREDENTIAL'}
                    </h3>
                    <p className="text-xs uppercase opacity-80">
                      {backendCredential.is_revoked 
                        ? `Revoked on ${new Date(backendCredential.revoked_at).toLocaleDateString()} by issuing institution.` 
                        : 'Commitment hash verified against official database & blockchain registry.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#EAE9E4] border border-[#131313] p-6 space-y-4 text-xs font-mono">
                <div>
                  <span className="text-gray-600 block uppercase font-bold text-[10px] mb-1">DEGREE / QUALIFICATION:</span>
                  <span className="text-base font-bold text-[#131313] uppercase">{backendCredential.degree}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white p-3 border border-[#131313]">
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">STUDENT NAME</span>
                    <span className="font-bold text-[#131313]">{backendCredential.student_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">STUDENT ID</span>
                    <span className="font-bold text-[#FF5C00]">{backendCredential.student_id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white p-3 border border-[#131313]">
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">CGPA SCORE</span>
                    <span className="font-bold text-[#131313]">{backendCredential.cgpa} / 10.0</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">TOTAL CREDITS</span>
                    <span className="font-bold text-[#131313]">{backendCredential.credits} UNITS</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600 block uppercase font-bold text-[10px] mb-1">ISSUING INSTITUTION:</span>
                  <span className="text-[#131313] uppercase font-bold">{backendCredential.institution_name}</span>
                </div>

                <div>
                  <span className="text-gray-600 block uppercase font-bold text-[10px] mb-1">CRYPTOGRAPHIC COMMITMENT HASH (SHA-256):</span>
                  <span className="break-all font-mono font-bold text-[#FF5C00]">{backendCredential.commitment_hash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ZK PROOF VERIFICATION */}
      {activeTab === 'ZK' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
              PASTE ZERO-KNOWLEDGE PROOF PACKAGE (JSON EXPORTED FROM ZK STUDIO)
            </label>
            <textarea
              rows={6}
              value={zkPackageInput}
              onChange={(e) => setZkPackageInput(e.target.value)}
              placeholder='{"zk_version": "1.0.0-Groth16", "proof_signature": "0xzk_...", "public_inputs": {...}}'
              className="w-full bg-[#EAE9E4] p-4 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
            />
          </div>

          <button
            onClick={handleVerifyZkProof}
            disabled={!zkPackageInput.trim()}
            className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF5C00]" />
            <span>VERIFY ZERO-KNOWLEDGE PROOF PACKAGE</span>
          </button>

          {zkVerificationResult && (
            <div className={`p-6 border-2 font-mono space-y-3 ${
              zkVerificationResult.isValid
                ? 'bg-[#131313] text-white border-[#131313]'
                : 'bg-red-100 text-red-900 border-red-500'
            }`}>
              <div className="flex items-center gap-2 font-bold uppercase">
                {zkVerificationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-[#FF5C00]" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm">
                  {zkVerificationResult.isValid ? 'ZERO-KNOWLEDGE PROOF VERIFIED VALID!' : 'INVALID ZK PROOF'}
                </span>
              </div>
              <p className="text-xs uppercase">{zkVerificationResult.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyCredentialCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full max-w-3xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-12 min-h-[300px] animate-pulse" />;
  }

  return <VerifyCredentialCardInner />;
}
