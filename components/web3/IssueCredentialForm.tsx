'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/lib/auth/context';
import { ShieldCheck, CheckCircle2, Copy, AlertCircle, Building2, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function IssueCredentialFormInner() {
  const { isConnected, address } = useAccount();
  const { token, user } = useAuth();
  
  const [studentId, setStudentId] = useState('EDU-2026-9283');
  const [studentName, setStudentName] = useState('Jane Doe');
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [cgpa, setCgpa] = useState('8.47');
  const [credits, setCredits] = useState('142');
  const [studentWallet, setStudentWallet] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedResult, setIssuedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIssuedResult(null);

    if (!studentId.trim() || !studentName.trim() || !degree.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/credentials/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          student_id: studentId.trim(),
          student_name: studentName.trim(),
          degree: degree.trim(),
          cgpa: parseFloat(cgpa),
          credits: parseInt(credits, 10),
          student_wallet: studentWallet.trim() || (address ? address.toLowerCase() : undefined),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Issuance failed' }));
        throw new Error(errorData.detail || 'Could not issue credential.');
      }

      const data = await res.json();
      setIssuedResult(data);
    } catch (err: any) {
      setError(err.message || 'Error connecting to issuance service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-8 md:p-12 space-y-8 font-mono">
      <div className="flex items-center gap-4 border-b border-[#131313] pb-6">
        <div className="w-12 h-12 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313] font-bold">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold tracking-widest text-[#FF5C00] uppercase block">
            [ INSTITUTION ISSUANCE PORTAL ]
          </span>
          <h2 className="text-2xl md:text-3xl font-archivo font-bold uppercase text-[#131313]">
            Issue Academic Credential
          </h2>
        </div>
      </div>

      {/* Warning if not logged in or not institution */}
      {user?.role && user.role !== 'INSTITUTION' && user.role !== 'ADMIN' && (
        <div className="bg-[#FF5C00] text-black p-4 border border-[#131313] text-xs font-mono uppercase font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: You are currently logged in as {user.role}. Standard authorization requires INSTITUTION or ADMIN role.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-mono uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateCredential} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              1. STUDENT ID *
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
              placeholder="e.g. EDU-2026-9283"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              2. STUDENT FULL NAME *
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              3. DEGREE / QUALIFICATION *
            </label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              required
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
              placeholder="e.g. B.Tech Computer Science"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              4. CGPA (10-POINT SCALE) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              required
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
              placeholder="8.47"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              5. TOTAL CREDITS EARNED *
            </label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              required
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
              placeholder="142"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              6. STUDENT WALLET ADDRESS (OPTIONAL)
            </label>
            <input
              type="text"
              value={studentWallet}
              onChange={(e) => setStudentWallet(e.target.value)}
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
              placeholder="0x... (Linked for automatic student passport delivery)"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF5C00]" />
            <span>{isSubmitting ? 'GENERATING CRYPTOGRAPHIC COMMITMENT...' : 'REGISTER & ISSUE CREDENTIAL BY STUDENT ID'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Issued Credential Result Card */}
      {issuedResult && (
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <div className="flex items-center gap-2 font-bold uppercase text-[#FF5C00]">
              <CheckCircle2 className="w-5 h-5 text-[#FF5C00]" />
              <span className="text-sm">CREDENTIAL ISSUED & VERIFIED ON-CHAIN</span>
            </div>
            <button
              onClick={() => copyToClipboard(issuedResult.commitment_hash)}
              className="flex items-center gap-1.5 text-xs text-white hover:text-[#FF5C00] bg-gray-800 px-3 py-1.5 border border-gray-700 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedHash ? 'COPIED HASH!' : 'COPY COMMITMENT HASH'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400 block uppercase">CREDENTIAL ID:</span>
              <span className="font-bold text-white uppercase">{issuedResult.id}</span>
            </div>

            <div>
              <span className="text-gray-400 block uppercase">STUDENT ID:</span>
              <span className="font-bold text-[#FF5C00] uppercase">{issuedResult.student_id}</span>
            </div>

            <div>
              <span className="text-gray-400 block uppercase">STUDENT NAME:</span>
              <span className="font-bold text-white uppercase">{issuedResult.student_name}</span>
            </div>

            <div>
              <span className="text-gray-400 block uppercase">DEGREE / CGPA:</span>
              <span className="font-bold text-white uppercase">{issuedResult.degree} ({issuedResult.cgpa} CGPA)</span>
            </div>

            <div>
              <span className="text-gray-400 block uppercase">ISSUING INSTITUTION:</span>
              <span className="font-bold text-white uppercase">{issuedResult.institution_name}</span>
            </div>

            <div>
              <span className="text-gray-400 block uppercase">ISSUED TIMESTAMP:</span>
              <span className="font-bold text-white uppercase">{new Date(issuedResult.issued_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-4 border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">CRYPTOGRAPHIC COMMITMENT HASH (SHA-256):</span>
            <p className="text-xs font-mono text-[#FF5C00] break-all font-bold">{issuedResult.commitment_hash}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssueCredentialForm() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full max-w-3xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-12 min-h-[300px] animate-pulse" />;
  }

  return <IssueCredentialFormInner />;
}
