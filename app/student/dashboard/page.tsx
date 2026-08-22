'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CredentialDetailModal from '@/components/passport/CredentialDetailModal';
import { useAuth } from '@/lib/auth/context';
import { LogOut, Award, ShieldCheck, Search, Building2, Calendar, FileCheck, Hash, ExternalLink, Filter, Send, CheckCircle2, XCircle, Clock, Smartphone, Copy, Check } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function StudentDashboardContent() {
  const { user, token, logout } = useAuth();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Copy Key state
  const [copiedKey, setCopiedKey] = useState(false);

  // Pending Access Requests State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchMyCredentials = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/credentials/my-passport`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error('Error fetching passport credentials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!token) return;
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE}/access-requests/student-pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error('Error fetching pending access requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyCredentials();
    fetchPendingRequests();
  }, [token]);

  const handleRespondToRequest = async (requestId: string, statusChoice: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE}/access-requests/respond/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusChoice }),
      });

      if (res.ok) {
        await fetchPendingRequests();
      }
    } catch (err) {
      console.error('Error responding to access request:', err);
    }
  };

  const handleSearchByStudentId = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);

    if (!searchStudentId.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/credentials/student/${encodeURIComponent(searchStudentId.trim())}`);
      if (!res.ok) {
        throw new Error('No credentials found for this Student ID.');
      }
      const data = await res.json();
      if (data.length === 0) {
        setSearchError(`No verified credentials issued under Student ID "${searchStudentId}".`);
      } else {
        setSearchResult(data);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error searching student credentials.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyMobileKey = () => {
    const mobileKey = user?.mobile_access_key || `EDUPASS-KEY-${user?.student_id?.slice(-4) || '991A'}-8819-2026`;
    navigator.clipboard.writeText(mobileKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const displayedCredentials = (searchResult !== null ? searchResult : credentials).filter((c) => {
    if (filterType === 'ALL') return true;
    return (c.credential_type || 'DEGREE').toUpperCase() === filterType;
  });

  const activeStudentId = user?.student_id || `EDU-2026-${user?.wallet_address?.slice(-4).toUpperCase() || '0687'}`;
  const activeMobileKey = user?.mobile_access_key || `EDUPASS-KEY-0B1C-9414-2026`;

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-8">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                STUDENT PASSPORT HUB
              </span>
              <div className="bg-[#222222] text-[#FF5C00] px-3 py-1 text-xs font-bold uppercase flex items-center gap-1 border border-[#333333]">
                <Hash className="w-3.5 h-3.5" />
                <span>STUDENT ID: {activeStudentId}</span>
              </div>
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              STUDENT DASHBOARD
            </h1>
            <p className="text-xs uppercase text-gray-300">
              PASSPORT HOLDER: <strong>{user?.full_name}</strong> ({user?.wallet_address || user?.email})
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

        {/* 📱 Mobile App Access Key Widget */}
        <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-3 font-mono">
          <div className="flex justify-between items-center border-b border-[#131313] pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FF5C00]" />
              <span className="text-xs font-bold uppercase text-[#131313]">
                📱 MOBILE APP UNIQUE ACCESS KEY (REQUIRED FOR ANDROID LOGIN)
              </span>
            </div>
            <span className="bg-[#131313] text-[#FF5C00] text-[10px] font-bold px-2 py-0.5 uppercase">
              BIOMETRIC BINDING ACTIVE
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#EAE9E4] p-4 border border-[#131313]">
            <div>
              <span className="text-[10px] text-gray-600 block uppercase font-bold">YOUR UNIQUE MOBILE KEY:</span>
              <span className="font-mono text-base md:text-lg font-bold text-[#FF5C00] tracking-wider break-all">
                {activeMobileKey}
              </span>
            </div>

            <button
              onClick={copyMobileKey}
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono text-xs font-bold uppercase px-5 py-2.5 border border-[#131313] transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>KEY COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#FF5C00]" />
                  <span>COPY KEY FOR MOBILE LOGIN</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 uppercase">
            Use <strong>User ID ({activeStudentId})</strong> + <strong>Mobile Key</strong> + <strong>Fingerprint / Face ID</strong> to log into the Android Mobile App.
          </p>
        </div>

        {/* Incoming Employer Access Requests Widget */}
        {pendingRequests.filter(r => r.status === 'PENDING').length > 0 && (
          <div className="bg-[#131313] text-white border-2 border-[#131313] p-6 space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 text-[#FF5C00] font-bold text-xs uppercase">
                <Clock className="w-4 h-4 text-[#FF5C00] animate-pulse" />
                <span>INCOMING EMPLOYER ACCESS REQUESTS ({pendingRequests.filter(r => r.status === 'PENDING').length})</span>
              </div>
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-2 py-0.5 uppercase">
                ACTION REQUIRED
              </span>
            </div>

            <div className="space-y-3">
              {pendingRequests.filter(r => r.status === 'PENDING').map((req) => (
                <div key={req.id} className="bg-[#1A1A1A] p-4 border border-gray-800 flex justify-between items-center gap-4 text-xs">
                  <div>
                    <span className="text-[#FF5C00] font-bold uppercase text-[10px] block">{req.purpose}</span>
                    <h3 className="font-bold uppercase text-sm text-white">{req.employer_name}</h3>
                    <p className="text-[10px] text-gray-400">REQUIRED DOCUMENTS: {req.required_doc_types}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespondToRequest(req.id, 'APPROVED')}
                      className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono font-bold text-[10px] uppercase px-4 py-2 border border-[#131313] transition-colors cursor-pointer"
                    >
                      APPROVE & GRANT
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(req.id, 'REJECTED')}
                      className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase px-3 py-2 border border-[#131313] transition-colors cursor-pointer"
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student ID Query Bar */}
        <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-[#131313]">
              LOOKUP CREDENTIALS BY STUDENT ID
            </span>
            {searchResult !== null && (
              <button
                onClick={() => { setSearchResult(null); setSearchStudentId(''); }}
                className="text-xs font-bold text-[#FF5C00] underline uppercase cursor-pointer"
              >
                RESET SEARCH
              </button>
            )}
          </div>

          <form onSubmit={handleSearchByStudentId} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              placeholder={`e.g. ${activeStudentId}`}
              className="flex-1 bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-6 py-3 border border-[#131313] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#FF5C00]" />
              <span>{isSearching ? 'SEARCHING...' : 'FETCH CREDENTIAL'}</span>
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-red-600 uppercase font-bold">{searchError}</p>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap border-2 border-[#131313] bg-[#E2E1DC]">
          {['ALL', 'DEGREE', 'MARKSHEET', 'TC', 'PROVISIONAL', 'SKILL', 'WORK_EXPERIENCE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`flex-1 min-w-[100px] py-3 text-[11px] font-bold uppercase transition-colors border-r border-[#131313] cursor-pointer ${
                filterType === cat ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
              }`}
            >
              {cat === 'ALL' ? 'ALL DOCUMENTS' : cat}
            </button>
          ))}
        </div>

        {/* Credentials Display List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#131313] pb-4">
            <h2 className="font-anton text-2xl uppercase text-[#131313]">
              VERIFIED ACADEMIC & CAREER PASSPORT DOCUMENTS ({displayedCredentials.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center text-xs font-bold uppercase animate-pulse">
              LOADING PASSPORT RECORDS...
            </div>
          ) : displayedCredentials.length === 0 ? (
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center space-y-4">
              <Award className="w-10 h-10 text-[#FF5C00] mx-auto" />
              <p className="text-xs font-bold uppercase text-[#131313]">
                No {filterType !== 'ALL' ? filterType : ''} credentials found under Student ID ({activeStudentId}).
              </p>
              <p className="text-xs uppercase text-gray-600 max-w-md mx-auto">
                Ask your institution or employer to issue your credential to Student ID: <strong>{activeStudentId}</strong> or select another category filter above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedCredentials.map((cred) => (
                <div
                  key={cred.id}
                  onClick={() => setSelectedCredential(cred)}
                  className="bg-[#131313] hover:border-[#FF5C00] text-white border-2 border-[#131313] p-6 space-y-6 flex flex-col justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-2.5 py-1 uppercase">
                        {cred.credential_type || 'VERIFIED CREDENTIAL'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        STUDENT ID: {cred.student_id}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-anton text-2xl uppercase text-white tracking-tight group-hover:text-[#FF5C00] transition-colors">
                        {cred.degree}
                      </h3>
                      <p className="text-xs text-[#FF5C00] uppercase font-bold mt-0.5">
                        {cred.student_name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-[#1A1A1A] p-4 border border-gray-800 text-xs">
                      {cred.credential_type === 'MARKSHEET' ? (
                        <>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">SEMESTER</span>
                            <span className="text-white font-bold text-sm">{cred.semester || 'SEMESTER 5'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">GPA / RESULT</span>
                            <span className="text-[#FF5C00] font-bold text-sm">VERIFIED</span>
                          </div>
                        </>
                      ) : cred.credential_type === 'WORK_EXPERIENCE' ? (
                        <>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">TYPE</span>
                            <span className="text-[#FF5C00] font-bold text-sm">EMPLOYMENT PROOF</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">STATUS</span>
                            <span className="text-white font-bold text-sm">VERIFIED WORK</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">CGPA SCORE</span>
                            <span className="text-white font-bold text-base">{cred.cgpa || '8.5'} / 10.0</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">TOTAL CREDITS</span>
                            <span className="text-white font-bold text-base">{cred.credits || '120'} UNITS</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Building2 className="w-3.5 h-3.5 text-[#FF5C00]" />
                        <span>ISSUED BY: {cred.institution_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>DATE: {new Date(cred.issued_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">COMMITMENT HASH:</span>
                      <span className="text-[9px] text-[#FF5C00] font-bold uppercase flex items-center gap-1">
                        <span>MANAGE DETAILS</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-[10px] text-[#FF5C00] font-mono break-all font-bold">{cred.commitment_hash}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Credential Detail Modal */}
      {selectedCredential && (
        <CredentialDetailModal
          credential={selectedCredential}
          onClose={() => setSelectedCredential(null)}
        />
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
