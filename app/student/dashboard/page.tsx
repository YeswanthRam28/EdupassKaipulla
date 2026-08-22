'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CredentialDetailModal from '@/components/passport/CredentialDetailModal';
import { useAuth } from '@/lib/auth/context';
import { LogOut, Award, ShieldCheck, Search, Building2, Calendar, FileCheck, Hash, ExternalLink } from 'lucide-react';

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

  // Auto-fetch credentials bound to this student's session & student ID
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
        }
      } catch (err) {
        console.error('Error fetching passport credentials:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyCredentials();
  }, [token]);

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

  const displayedCredentials = searchResult !== null ? searchResult : credentials;
  const activeStudentId = user?.student_id || `EDU-2026-${user?.wallet_address?.slice(-4).toUpperCase() || '9283'}`;

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

        {/* Credentials Display List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#131313] pb-4">
            <h2 className="font-anton text-2xl uppercase text-[#131313]">
              VERIFIED ACADEMIC PASSPORT CREDENTIALS ({displayedCredentials.length})
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
                No credentials issued under Student ID ({activeStudentId}) yet.
              </p>
              <p className="text-xs uppercase text-gray-600 max-w-md mx-auto">
                Ask your institution to issue your credential to Student ID: <strong>{activeStudentId}</strong> or search another ID above.
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
                        VERIFIED CREDENTIAL
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
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase">CGPA SCORE</span>
                        <span className="text-white font-bold text-base">{cred.cgpa} / 10.0</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase">TOTAL CREDITS</span>
                        <span className="text-white font-bold text-base">{cred.credits} UNITS</span>
                      </div>
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
