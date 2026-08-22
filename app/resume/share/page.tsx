'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Award, ShieldCheck, Cpu, CheckCircle2, AlertCircle, ExternalLink, Calendar, Building2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function RecruiterResumeViewContent() {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get('resume_id') || searchParams.get('student_id') || 'EDU-2026-0687';

  const [resumeData, setResumeData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicResume() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/resume/verify/${encodeURIComponent(resumeIdParam)}`);
        if (!res.ok) {
          throw new Error(`No verifiable resume found for query "${resumeIdParam}".`);
        }
        const data = await res.json();
        setResumeData(data);
      } catch (err: any) {
        setError(err.message || 'Error loading verifiable resume.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicResume();
  }, [resumeIdParam]);

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-10">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                PUBLIC RECRUITER VERIFICATION PORTAL
              </span>
              {resumeData && (
                <span className="bg-[#222222] text-[#FF5C00] px-3 py-1 text-xs font-bold uppercase border border-[#333333]">
                  RESUME ID: {resumeData.resume_id}
                </span>
              )}
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              VERIFIABLE CANDIDATE RESUME
            </h1>
            <p className="text-xs uppercase text-gray-300">
              CANDIDATE: <strong>{resumeData?.student_name || 'STUDENT'}</strong> ({resumeData?.student_id || resumeIdParam})
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-500 text-red-900 p-6 text-xs uppercase flex items-center gap-3 font-bold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold uppercase animate-pulse">
            LOADING CANDIDATE VERIFIABLE RESUME & SKILL GRAPH...
          </div>
        ) : resumeData && (
          <div className="space-y-10">

            {/* Verified Status Card */}
            <div className="bg-[#131313] text-white border-2 border-[#131313] p-6 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 font-bold text-xs uppercase">
                <CheckCircle2 className="w-6 h-6 text-[#FF5C00]" />
                <div>
                  <span className="text-base text-white font-archivo block">AUTHENTIC & CRYPTOGRAPHICALLY VERIFIED</span>
                  <span className="text-[10px] text-gray-400">Claims verified against on-chain EVM commitments and Neon PostgreSQL registry.</span>
                </div>
              </div>
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase shrink-0">
                100% VERIFIED
              </span>
            </div>

            {/* Skill Evidence Graph */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#131313] pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#FF5C00]" />
                  <h2 className="font-anton text-2xl uppercase text-[#131313]">
                    CANDIDATE SKILL EVIDENCE GRAPH ({resumeData.skills_graph.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumeData.skills_graph.map((sk: any, idx: number) => (
                  <div key={idx} className="bg-[#131313] text-white p-5 border-2 border-[#131313] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5 uppercase">
                          {sk.proficiency}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">SCORE: {sk.score}/100</span>
                      </div>

                      <h3 className="font-archivo font-bold text-base uppercase text-white">
                        {sk.skill_name}
                      </h3>

                      <p className="text-[10px] text-gray-300">SOURCE: {sk.source_claim}</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-2.5 border border-gray-800 space-y-1 text-[9px] text-gray-400">
                      <span>VERIFIED BY: {sk.verified_by}</span>
                      <p className="font-mono text-[#FF5C00] truncate">HASH: {sk.proof_commitment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Education & Work Claims */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#131313] pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FF5C00]" />
                  <h2 className="font-anton text-2xl uppercase text-[#131313]">
                    VERIFIED ACADEMIC & CAREER RECORDS ({resumeData.verified_credentials.length})
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {resumeData.verified_credentials.map((cred: any) => (
                  <div key={cred.id} className="bg-[#131313] text-white p-6 border-2 border-[#131313] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5 uppercase">
                          {cred.credential_type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">STUDENT ID: {cred.student_id}</span>
                      </div>

                      <h3 className="font-anton text-2xl uppercase text-white">
                        {cred.degree}
                      </h3>

                      <p className="text-xs text-gray-300">ISSUING AUTHORITY: <strong>{cred.institution_name}</strong></p>
                    </div>

                    <div className="bg-[#1A1A1A] p-3 border border-gray-800 text-[10px] font-mono text-right space-y-1 shrink-0">
                      <span className="text-[#FF5C00] font-bold uppercase block">COMMITMENT VERIFIED</span>
                      <span className="text-gray-400 block break-all font-mono">{cred.commitment_hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default function RecruiterResumeViewPage() {
  return (
    <Suspense fallback={<div className="p-12 font-mono text-xs uppercase font-bold animate-pulse">LOADING RESUME...</div>}>
      <RecruiterResumeViewContent />
    </Suspense>
  );
}
