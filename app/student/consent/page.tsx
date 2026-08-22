'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { ShieldCheck, Lock, Key, Trash2, CheckCircle2, AlertCircle, Plus, Calendar, Clock } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function StudentConsentContent() {
  const { user, token } = useAuth();
  const [grants, setGrants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Grant Form State
  const [verifierName, setVerifierName] = useState('Google Mobility Verification Team');
  const [verifierWallet, setVerifierWallet] = useState('');
  const [purpose, setPurpose] = useState('EMPLOYMENT_VERIFICATION');
  const [validDays, setValidDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrants = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/consent/my-grants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGrants(data);
      }
    } catch (err) {
      console.error('Error fetching consent grants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, [token]);

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verifierName.trim()) {
      setError('Please enter the verifier or employer name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/consent/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verifier_name: verifierName.trim(),
          verifier_wallet: verifierWallet.trim() || undefined,
          purpose,
          valid_days: Number(validDays),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Could not grant consent token.');
      }

      await fetchGrants();
      setVerifierName('');
      setVerifierWallet('');
    } catch (err: any) {
      setError(err.message || 'Error granting consent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    if (!confirm('Are you sure you want to revoke this consent token? The verifier will lose access immediately.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/consent/revoke/${grantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await fetchGrants();
      }
    } catch (err) {
      console.error('Error revoking consent grant:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-10">
        
        {/* Header Banner */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                ZERO-TRUST FIREWALL
              </span>
              <span className="text-xs uppercase text-gray-300">STUDENT ID: {user?.student_id || 'ACTIVE'}</span>
            </div>
            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              CONSENT & PRIVACY MANAGEMENT
            </h1>
            <p className="text-xs uppercase text-gray-300 max-w-xl">
              Grant time-bound consent tokens to employers or universities to view your credential details. Revoke access anytime with one click.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Grant Form Column */}
          <form onSubmit={handleGrantConsent} className="lg:col-span-5 bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
            <div className="border-b border-[#131313] pb-4">
              <h2 className="font-anton text-2xl uppercase text-[#131313] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FF5C00]" />
                <span>GRANT CONSENT TOKEN</span>
              </h2>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-500 text-red-900 p-3 text-xs uppercase flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">
                VERIFIER / EMPLOYER NAME *
              </label>
              <input
                type="text"
                required
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder="e.g. Google Mobility Team or Harvard Admissions"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">
                VERIFIER WALLET ADDRESS (OPTIONAL)
              </label>
              <input
                type="text"
                value={verifierWallet}
                onChange={(e) => setVerifierWallet(e.target.value)}
                placeholder="0x..."
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
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
                <option value="EMPLOYMENT_VERIFICATION">EMPLOYMENT BACKGROUND VERIFICATION</option>
                <option value="GRADUATE_ADMISSIONS">GRADUATE UNIVERSITY ADMISSIONS</option>
                <option value="SCHOLARSHIP_APPLICATION">SCHOLARSHIP & FUNDING REVIEW</option>
                <option value="VISA_IMMIGRATION">VISA & CROSS-BORDER MOBILITY</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">
                VALIDITY DURATION *
              </label>
              <select
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs font-bold uppercase focus:outline-none focus:border-[#FF5C00]"
              >
                <option value={7}>7 DAYS (SHORT-TERM REVIEW)</option>
                <option value={30}>30 DAYS (STANDARD HIRING CYCLE)</option>
                <option value={90}>90 DAYS (QUARTERLY ACCESS)</option>
                <option value={365}>365 DAYS (FULL ACADEMIC YEAR)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase py-4 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-[#FF5C00]" />
              <span>{isSubmitting ? 'GRANTING CONSENT...' : 'ISSUE CONSENT ACCESS TOKEN'}</span>
            </button>
          </form>

          {/* Grants Display Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#131313] pb-3">
                <h2 className="font-anton text-2xl uppercase text-[#131313]">
                  ACTIVE & REVOKED CONSENT TOKENS ({grants.length})
                </h2>
              </div>

              {isLoading ? (
                <div className="p-8 text-center text-xs font-bold uppercase animate-pulse">
                  LOADING CONSENT GRANTS...
                </div>
              ) : grants.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#FF5C00] mx-auto" />
                  <p className="text-xs font-bold uppercase text-[#131313]">No active consent tokens issued.</p>
                  <p className="text-xs uppercase text-gray-600 max-w-sm mx-auto">
                    Use the form on the left to issue a time-bound consent token for an employer or university.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grants.map((g) => {
                    const isActive = g.status === 'ACTIVE';
                    return (
                      <div
                        key={g.id}
                        className={`p-5 border-2 flex justify-between items-start gap-4 ${
                          isActive 
                            ? 'bg-[#131313] text-white border-[#131313]' 
                            : 'bg-red-100 border-red-500 text-red-900'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 uppercase ${
                              isActive ? 'bg-[#FF5C00] text-[#131313]' : 'bg-red-600 text-white'
                            }`}>
                              {g.status}
                            </span>
                            <span className="text-[10px] font-bold uppercase opacity-80">{g.purpose}</span>
                          </div>

                          <h3 className="font-archivo font-bold text-base uppercase">
                            {g.verifier_name}
                          </h3>

                          {g.verifier_wallet && (
                            <p className="text-[10px] font-mono opacity-80">
                              WALLETT: {g.verifier_wallet}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-[10px] opacity-80 pt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#FF5C00]" />
                              <span>GRANTED: {new Date(g.created_at).toLocaleDateString()}</span>
                            </div>
                            {g.expires_at && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>EXPIRES: {new Date(g.expires_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <button
                            onClick={() => handleRevokeGrant(g.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase px-3 py-1.5 border border-[#131313] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>REVOKE</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default function StudentConsentPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <StudentConsentContent />
    </ProtectedRoute>
  );
}
