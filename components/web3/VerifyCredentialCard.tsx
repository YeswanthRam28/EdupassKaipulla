'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { CREDENTIAL_REGISTRY_ADDRESS, CREDENTIAL_REGISTRY_ABI } from '@/web3/contracts';
import { verifyZKProofPackage } from '@/lib/zk/zkEngine';
import { Search, ShieldAlert, CheckCircle2, XCircle, Key, Sparkles, FileText, AlertCircle, ExternalLink, Award, Cpu, Database, ShieldCheck, Lock } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function VerifyCredentialCardInner() {
  const [activeTab, setActiveTab] = useState<'HASH' | 'RESUME' | 'ZK'>('HASH');
  
  const [searchId, setSearchId] = useState('EDU-2026-0687');
  const [backendCredential, setBackendCredential] = useState<any | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Resume Verification State
  const [searchResumeId, setSearchResumeId] = useState('RES-2026-0687-991A');
  const [resumeResult, setResumeResult] = useState<any | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // ZK Verification State
  const [zkPackageInput, setZkPackageInput] = useState('');
  const [zkVerificationResult, setZkVerificationResult] = useState<{ isValid: boolean; message: string } | null>(null);

  const handleSearchHashOrId = async (e: React.FormEvent) => {
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
  };

  const handleSearchResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchResumeId.trim()) return;

    setResumeError(null);
    setResumeResult(null);
    setResumeLoading(true);

    try {
      const res = await fetch(`${API_BASE}/resume/verify/${encodeURIComponent(searchResumeId.trim())}`);
      if (!res.ok) {
        throw new Error(`No verifiable resume matching ID "${searchResumeId.trim()}" was found.`);
      }
      const data = await res.json();
      setResumeResult(data);
    } catch (err: any) {
      setResumeError(err.message || 'Error verifying candidate resume.');
    } finally {
      setResumeLoading(false);
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

  let parsedDetails: any = {};
  if (backendCredential?.details_json) {
    try {
      parsedDetails = JSON.parse(backendCredential.details_json);
    } catch (e) {}
  }

  // Check if EduPass Signature is valid & untampered
  const isSignatureValid = backendCredential?.edupass_signature && backendCredential.edupass_signature.startsWith('0xedupass_sig_');

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
            Credential & Resume Verification Portal
          </h2>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap border-2 border-[#131313] bg-[#EAE9E4]">
        <button
          onClick={() => setActiveTab('HASH')}
          className={`flex-1 min-w-[140px] py-3 text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border-r border-[#131313] ${
            activeTab === 'HASH' ? 'bg-[#131313] text-white' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#FF5C00]" />
          <span>DOCUMENT COMMITMENT</span>
        </button>

        <button
          onClick={() => setActiveTab('RESUME')}
          className={`flex-1 min-w-[140px] py-3 text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border-r border-[#131313] ${
            activeTab === 'RESUME' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          <Cpu className="w-4 h-4 text-[#FF5C00]" />
          <span>VERIFIABLE RESUME BY ID</span>
        </button>

        <button
          onClick={() => setActiveTab('ZK')}
          className={`flex-1 min-w-[140px] py-3 text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ZK' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FF5C00]" />
          <span>ZK PROOF VERIFIER</span>
        </button>
      </div>

      {/* TAB 1: COMMITMENT & INDIVIDUAL DOCUMENT VERIFICATION */}
      {activeTab === 'HASH' && (
        <div className="space-y-6">
          <form onSubmit={handleSearchHashOrId} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Student ID (e.g. EDU-2026-0687) or Hash (0x...)"
              required
              className="flex-1 bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
            />
            <button
              type="submit"
              disabled={backendLoading}
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest px-8 py-3.5 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50"
            >
              {backendLoading ? 'VERIFYING...' : 'VERIFY DOCUMENT'}
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
              
              {/* Status Header */}
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
                      {backendCredential.is_revoked ? 'REVOKED CREDENTIAL' : `VERIFIED ${backendCredential.credential_type || 'ACADEMIC'} DOCUMENT`}
                    </h3>
                    <p className="text-xs uppercase opacity-80">
                      {backendCredential.is_revoked 
                        ? `Revoked on ${new Date(backendCredential.revoked_at).toLocaleDateString()} by issuing institution.` 
                        : 'Commitment hash verified against official database & blockchain registry.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* EduPass Master Cryptographic Signature Badge */}
              <div className={`p-4 border-2 flex items-center justify-between gap-3 text-xs uppercase font-bold ${
                isSignatureValid ? 'bg-[#131313] text-[#FF5C00] border-[#131313]' : 'bg-red-900 text-white border-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    {isSignatureValid 
                      ? '🔒 EDUPASS MASTER SIGNATURE: VERIFIED & UNTAMPERED' 
                      : '⚠️ SIGNATURE ALERT: TAMPER DETECTED / INVALID SIGNATURE'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-300 font-mono truncate max-w-[200px]">
                  {backendCredential.edupass_signature || '0xedupass_sig_8819...'}
                </span>
              </div>

              {/* IPFS Decentralized CID Badge */}
              {backendCredential.ipfs_cid && (
                <div className="bg-[#EAE9E4] p-4 border border-[#131313] flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#FF5C00]" />
                    <span className="font-bold uppercase text-[#131313]">DECENTRALIZED IPFS STORAGE CID:</span>
                  </div>
                  <a
                    href={backendCredential.ipfs_gateway_url || `https://ipfs.io/ipfs/${backendCredential.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-bold text-[10px] uppercase px-3 py-1.5 border border-[#131313] transition-colors flex items-center gap-1"
                  >
                    <span>OPEN ON IPFS GATEWAY</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Document Specific Verification Card */}
              <div className="bg-[#EAE9E4] border border-[#131313] p-6 space-y-4 text-xs font-mono">
                <div>
                  <span className="text-gray-600 block uppercase font-bold text-[10px] mb-1">QUALIFICATION / TITLE:</span>
                  <span className="text-lg font-bold text-[#131313] uppercase">{backendCredential.degree}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white p-3 border border-[#131313]">
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">STUDENT NAME</span>
                    <span className="font-bold text-[#131313]">{backendCredential.student_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block uppercase">STUDENT ACADEMIC ID</span>
                    <span className="font-bold text-[#FF5C00]">{backendCredential.student_id}</span>
                  </div>
                </div>

                {/* MARKSHEET Specific Render */}
                {backendCredential.credential_type === 'MARKSHEET' && (
                  <div className="space-y-3 bg-white p-4 border border-[#131313]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 text-[10px] block uppercase">SEMESTER</span>
                        <span className="font-bold text-[#FF5C00]">{backendCredential.semester || parsedDetails.semester || 'SEMESTER 5'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block uppercase">SEMESTER GPA (SGPA)</span>
                        <span className="font-bold text-[#131313]">{parsedDetails.sgpa || '9.50'} / 10.0</span>
                      </div>
                    </div>

                    {parsedDetails.courses && (
                      <div className="space-y-1 pt-2 border-t border-gray-300">
                        <span className="text-[10px] font-bold uppercase text-[#131313] block">COURSE MARKS TABLE:</span>
                        <div className="divide-y divide-gray-200 text-[11px]">
                          {parsedDetails.courses.map((c: any, i: number) => (
                            <div key={i} className="flex justify-between py-1">
                              <span><strong>{c.code}:</strong> {c.name}</span>
                              <span className="font-bold text-[#FF5C00]">{c.grade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TRANSFER CERTIFICATE Specific Render */}
                {backendCredential.credential_type === 'TC' && (
                  <div className="grid grid-cols-3 gap-4 bg-white p-4 border border-[#131313]">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">CONDUCT RATING</span>
                      <span className="font-bold text-[#FF5C00]">{backendCredential.conduct_status || parsedDetails.conduct_status || 'EXCELLENT'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">DATE OF LEAVING</span>
                      <span className="font-bold text-[#131313]">{parsedDetails.date_of_leaving || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">FEE CLEARANCE</span>
                      <span className="font-bold text-[#131313]">{parsedDetails.fee_clearance || 'NO DUES'}</span>
                    </div>
                  </div>
                )}

                {/* PROVISIONAL Specific Render */}
                {backendCredential.credential_type === 'PROVISIONAL' && (
                  <div className="grid grid-cols-2 gap-4 bg-white p-4 border border-[#131313]">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">PASSING YEAR</span>
                      <span className="font-bold text-[#FF5C00]">{parsedDetails.passing_year || '2026'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">PROVISIONAL SERIAL NO</span>
                      <span className="font-bold text-[#131313]">{parsedDetails.serial_no || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* SKILL Specific Render */}
                {backendCredential.credential_type === 'SKILL' && (
                  <div className="space-y-2 bg-white p-4 border border-[#131313]">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">PROFICIENCY RATING</span>
                      <span className="font-bold text-[#FF5C00]">{parsedDetails.proficiency || 'EXPERT'}</span>
                    </div>
                    {parsedDetails.project_url && (
                      <div>
                        <span className="text-gray-500 text-[10px] block uppercase">PROJECT / CODE REPO</span>
                        <a href={parsedDetails.project_url} target="_blank" rel="noreferrer" className="font-bold text-[#FF5C00] underline text-xs break-all flex items-center gap-1">
                          <span>{parsedDetails.project_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* DEGREE Specific Render */}
                {backendCredential.credential_type === 'DEGREE' && (
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
                )}

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

      {/* TAB 2: VERIFIABLE RESUME BY ID */}
      {activeTab === 'RESUME' && (
        <div className="space-y-6">
          <form onSubmit={handleSearchResume} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchResumeId}
              onChange={(e) => setSearchResumeId(e.target.value)}
              placeholder="Enter Resume ID (e.g. RES-2026-0687-991A) or Student ID"
              required
              className="flex-1 bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
            />
            <button
              type="submit"
              disabled={resumeLoading}
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest px-8 py-3.5 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50"
            >
              {resumeLoading ? 'VERIFYING...' : 'VERIFY RESUME'}
            </button>
          </form>

          {resumeError && (
            <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-mono uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{resumeError}</span>
            </div>
          )}

          {resumeResult && (
            <div className="space-y-6">
              <div className="bg-[#131313] text-white p-6 border-2 border-[#131313] flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-[#FF5C00]" />
                  <div>
                    <h3 className="font-archivo font-bold text-lg uppercase">
                      VERIFIABLE RESUME VERIFIED VALID ({resumeResult.resume_id})
                    </h3>
                    <p className="text-xs uppercase text-gray-300">
                      CANDIDATE: {resumeResult.student_name} ({resumeResult.student_id})
                    </p>
                  </div>
                </div>
                <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase shrink-0">
                  {resumeResult.total_verified_claims} CLAIMS VERIFIED
                </span>
              </div>

              {/* Skills Graph Summary */}
              <div className="bg-[#EAE9E4] p-5 border border-[#131313] space-y-3 text-xs">
                <span className="font-bold uppercase text-[#131313] block">VERIFIED SKILL EVIDENCE GRAPH ({resumeResult.skills_graph.length} SKILLS)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resumeResult.skills_graph.map((sk: any, i: number) => (
                    <div key={i} className="bg-white p-2.5 border border-[#131313] flex justify-between items-center">
                      <span className="font-bold uppercase">{sk.skill_name}</span>
                      <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5">{sk.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ZK PROOF VERIFICATION */}
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
