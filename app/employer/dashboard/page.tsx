'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import IssueCredentialForm from '@/components/web3/IssueCredentialForm';
import { useAuth } from '@/lib/auth/context';
import { Building2, Send, CheckCircle2, Clock, XCircle, LogOut, Award, Search, Plus, AlertCircle, ExternalLink, Hash } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function EmployerDashboardContent() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ISSUE' | 'REQUEST' | 'TRACKER'>('ISSUE');

  // Request Form State
  const [targetStudentId, setTargetStudentId] = useState('EDU-2026-0687');
  const [purpose, setPurpose] = useState('EMPLOYMENT_BACKGROUND_CHECK');
  const [requiredDocs, setRequiredDocs] = useState('DEGREE,MARKSHEET,TC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);

  // Tracker State
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const activeRecruiterId = user?.institution_id || `REC-2026-${user?.wallet_address?.slice(-4).toUpperCase() || 'F336'}`;

  const fetchSentRequests = async () => {
    if (!token) return;
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE}/access-requests/employer-my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSentRequests(data);
      }
    } catch (err) {
      console.error('Error fetching sent access requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, [token]);

  const handleSendAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError(null);
    setReqSuccess(null);

    if (!targetStudentId.trim()) {
      setReqError('Please enter target student ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/access-requests/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: targetStudentId.trim().toUpperCase(),
          purpose,
          required_doc_types: requiredDocs,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Could not send access request.');
      }

      setReqSuccess(`Verification request sent to Student ID "${targetStudentId.trim().toUpperCase()}"!`);
      await fetchSentRequests();
      setActiveTab('TRACKER');
    } catch (err: any) {
      setReqError(err.message || 'Error sending access request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                VERIFIED EMPLOYER PORTAL
              </span>
              <div className="bg-[#222222] text-[#FF5C00] px-3 py-1 text-xs font-bold uppercase flex items-center gap-1 border border-[#333333]">
                <Hash className="w-3.5 h-3.5" />
                <span>RECRUITER ID: {activeRecruiterId}</span>
              </div>
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              EMPLOYER DASHBOARD
            </h1>
            <p className="text-xs uppercase text-gray-300">
              AUTHENTICATED RECRUITER: <strong>{user?.full_name}</strong> ({user?.email})
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono font-bold text-xs uppercase px-6 py-3 border border-[#131313] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex flex-wrap border-2 border-[#131313] bg-[#E2E1DC]">
          <button
            onClick={() => setActiveTab('ISSUE')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors border-r border-[#131313] flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ISSUE' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Award className="w-4 h-4 text-[#FF5C00]" />
            <span>1. ISSUE WORK & INTERNSHIP CREDENTIALS</span>
          </button>

          <button
            onClick={() => setActiveTab('REQUEST')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors border-r border-[#131313] flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'REQUEST' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Send className="w-4 h-4 text-[#FF5C00]" />
            <span>2. SEND STUDENT ACCESS REQUEST</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACKER')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'TRACKER' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#FF5C00]" />
            <span>3. SENT ACCESS REQUESTS TRACKER ({sentRequests.length})</span>
          </button>
        </div>

        {/* TAB 1: ISSUE WORK EXPERIENCE / INTERNSHIP CREDENTIALS */}
        {activeTab === 'ISSUE' && (
          <IssueCredentialForm />
        )}

        {/* TAB 2: SEND ACCESS VERIFICATION REQUEST */}
        {activeTab === 'REQUEST' && (
          <div className="max-w-2xl mx-auto bg-[#E2E1DC] border-2 border-[#131313] p-8 space-y-6">
            <div className="border-b border-[#131313] pb-4">
              <h2 className="font-anton text-2xl uppercase text-[#131313] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#FF5C00]" />
                <span>REQUEST STUDENT CREDENTIAL ACCESS</span>
              </h2>
            </div>

            {reqError && (
              <div className="bg-red-100 border border-red-500 text-red-900 p-3 text-xs uppercase flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reqError}</span>
              </div>
            )}

            {reqSuccess && (
              <div className="bg-[#131313] text-white p-4 border border-[#131313] text-xs font-bold uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5C00] shrink-0" />
                <span>{reqSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendAccessRequest} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#131313]">
                  TARGET STUDENT ACADEMIC ID *
                </label>
                <input
                  type="text"
                  required
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  placeholder="e.g. EDU-2026-0687"
                  className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase font-bold focus:outline-none focus:border-[#FF5C00]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#131313]">
                  VERIFICATION PURPOSE *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs font-bold uppercase focus:outline-none focus:border-[#FF5C00]"
                >
                  <option value="EMPLOYMENT_BACKGROUND_CHECK">EMPLOYMENT BACKGROUND VERIFICATION</option>
                  <option value="INTERNSHIP_VERIFICATION">INTERNSHIP & SKILL PROOF REVIEW</option>
                  <option value="SECURITY_CLEARANCE">SECURITY CLEARANCE AUDIT</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#131313]">
                  REQUIRED DOCUMENT TYPES *
                </label>
                <input
                  type="text"
                  required
                  value={requiredDocs}
                  onChange={(e) => setRequiredDocs(e.target.value)}
                  placeholder="DEGREE,MARKSHEET,TC"
                  className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase py-4 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#FF5C00]" />
                <span>{isSubmitting ? 'SENDING REQUEST...' : 'SEND FORMAL ACCESS REQUEST'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SENT ACCESS REQUESTS TRACKER */}
        {activeTab === 'TRACKER' && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#131313] pb-4">
              <h2 className="font-anton text-2xl uppercase text-[#131313]">
                SENT ACCESS VERIFICATION REQUESTS ({sentRequests.length})
              </h2>
            </div>

            {loadingRequests ? (
              <div className="p-8 text-center text-xs font-bold uppercase animate-pulse">
                LOADING SENT REQUESTS...
              </div>
            ) : sentRequests.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold uppercase text-gray-600">
                No access requests sent yet.
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-5 border-2 flex justify-between items-center gap-4 ${
                      req.status === 'APPROVED' 
                        ? 'bg-[#131313] text-white border-[#131313]' 
                        : req.status === 'REJECTED' 
                        ? 'bg-red-100 border-red-500 text-red-900' 
                        : 'bg-[#EAE9E4] text-[#131313] border-[#131313]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 uppercase ${
                          req.status === 'APPROVED' ? 'bg-[#FF5C00] text-[#131313]' : req.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{req.purpose}</span>
                      </div>

                      <h3 className="font-archivo font-bold text-base uppercase">
                        STUDENT ID: {req.student_id}
                      </h3>

                      <p className="text-[10px] opacity-80">REQUIRED DOCS: {req.required_doc_types}</p>
                      <p className="text-[10px] opacity-60">SENT ON: {new Date(req.created_at).toLocaleString()}</p>
                    </div>

                    {req.status === 'APPROVED' && (
                      <a
                        href={`/resume/share?student_id=${req.student_id}`}
                        className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono text-[10px] font-bold uppercase px-3 py-2 border border-[#131313] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>VIEW VERIFIABLE RESUME</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default function EmployerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['EMPLOYER', 'VERIFIER']}>
      <EmployerDashboardContent />
    </ProtectedRoute>
  );
}
