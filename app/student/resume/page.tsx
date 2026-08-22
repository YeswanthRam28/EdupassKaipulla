'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { Award, ShieldCheck, Sparkles, Share2, Copy, Send, CheckCircle2, Building2, Calendar, FileText, Cpu, ExternalLink, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function StudentResumeContent() {
  const { user, token } = useAuth();
  const [resumeData, setResumeData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Transmit Form State
  const [recruiterIdInput, setRecruiterIdInput] = useState('REC-2026-F336');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitMsg, setTransmitMsg] = useState<string | null>(null);
  const [transmitError, setTransmitError] = useState<string | null>(null);

  const fetchMyResume = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/resume/my-resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
      }
    } catch (err) {
      console.error('Error fetching verifiable resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResume();
  }, [token]);

  const copyPublicShareLink = () => {
    if (!resumeData) return;
    const shareUrl = `${window.location.origin}/resume/share?resume_id=${encodeURIComponent(resumeData.resume_id)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTransmitToRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransmitMsg(null);
    setTransmitError(null);

    if (!recruiterIdInput.trim()) {
      setTransmitError('Please enter recruiter ID or company code.');
      return;
    }

    setIsTransmitting(true);
    try {
      const res = await fetch(`${API_BASE}/resume/send-to-recruiter?recruiter_id=${encodeURIComponent(recruiterIdInput.trim())}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Transmission failed.');
      }

      const data = await res.json();
      setTransmitMsg(data.message);
      setRecruiterIdInput('');
    } catch (err: any) {
      setTransmitError(err.message || 'Error transmitting resume.');
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-10">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                VERIFIABLE CAREER PASSPORT
              </span>
              {resumeData && (
                <span className="bg-[#222222] text-[#FF5C00] px-3 py-1 text-xs font-bold uppercase border border-[#333333]">
                  RESUME ID: {resumeData.resume_id}
                </span>
              )}
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              VERIFIABLE RESUME & SKILL GRAPH
            </h1>
            <p className="text-xs uppercase text-gray-300">
              CANDIDATE: <strong>{user?.full_name}</strong> ({user?.student_id || 'ACTIVE'})
            </p>
          </div>

          <button
            onClick={copyPublicShareLink}
            className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono font-bold text-xs uppercase px-6 py-3 border border-[#131313] transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'SHARE LINK COPIED!' : 'COPY RECRUITER SHARE LINK'}</span>
          </button>
        </div>

        {/* Transmit to Recruiter Direct Modal / Bar */}
        <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#131313] pb-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-[#131313]">
              <Send className="w-4 h-4 text-[#FF5C00]" />
              <span>DIRECT TRANSMIT TO RECRUITER / COMPANY</span>
            </div>
            <span className="text-[10px] text-gray-600 uppercase font-bold">MODULE 45</span>
          </div>

          {transmitError && (
            <div className="bg-red-100 border border-red-500 text-red-900 p-3 text-xs uppercase flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{transmitError}</span>
            </div>
          )}

          {transmitMsg && (
            <div className="bg-[#131313] text-white p-3 border border-[#131313] text-xs font-bold uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF5C00] shrink-0" />
              <span>{transmitMsg}</span>
            </div>
          )}

          <form onSubmit={handleTransmitToRecruiter} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={recruiterIdInput}
              onChange={(e) => setRecruiterIdInput(e.target.value)}
              placeholder="Enter Recruiter ID (e.g. REC-2026-F336 or EMP-2026-GOOGLE)"
              className="flex-1 bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
            />
            <button
              type="submit"
              disabled={isTransmitting}
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-8 py-3 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTransmitting ? 'TRANSMITTING...' : 'TRANSMIT RESUME & PROOFS'}
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold uppercase animate-pulse">
            COMPILING SKILL EVIDENCE GRAPH & VERIFIABLE RESUME...
          </div>
        ) : resumeData && (
          <div className="space-y-10">

            {/* SECTION 1: SKILL EVIDENCE GRAPH */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#131313] pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#FF5C00]" />
                  <h2 className="font-anton text-2xl uppercase text-[#131313]">
                    SKILL EVIDENCE GRAPH ({resumeData.skills_graph.length})
                  </h2>
                </div>
                <span className="bg-[#131313] text-[#FF5C00] text-[10px] font-bold px-2 py-0.5 uppercase">
                  CRYPTOGRAPHICALLY BACKED
                </span>
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

                      <p className="text-[10px] text-gray-300">SOURCE CLAIM: {sk.source_claim}</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-2.5 border border-gray-800 space-y-1 text-[9px] text-gray-400">
                      <span>VERIFIED BY: {sk.verified_by}</span>
                      <p className="font-mono text-[#FF5C00] truncate">PROOF: {sk.proof_commitment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: VERIFIED EDUCATION & CAREER CLAIMS */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#131313] pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FF5C00]" />
                  <h2 className="font-anton text-2xl uppercase text-[#131313]">
                    VERIFIED EDUCATION & WORK CLAIMS ({resumeData.verified_credentials.length})
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

export default function StudentResumePage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <StudentResumeContent />
    </ProtectedRoute>
  );
}
