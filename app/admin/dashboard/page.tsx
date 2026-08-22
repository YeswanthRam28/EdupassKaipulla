'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TransactionMonitor from '@/components/web3/TransactionMonitor';
import { useAuth } from '@/lib/auth/context';
import { ShieldCheck, Cpu, Building2, Users, FileText, CheckCircle2, XCircle, LogOut, Plus, Activity, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function AdminDashboardContent() {
  const { user, token, logout } = useAuth();
  const [healthData, setHealthData] = useState<any | null>(null);
  const [issuers, setIssuers] = useState<any[]>([]);
  const [loadingIssuers, setLoadingIssuers] = useState(false);

  // New Issuer Form State
  const [newInstName, setNewInstName] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [newInstCountry, setNewInstCountry] = useState('UNITED STATES');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/system/health`);
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
    }
  };

  const fetchIssuers = async () => {
    if (!token) return;
    setLoadingIssuers(true);
    try {
      const res = await fetch(`${API_BASE}/issuers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIssuers(data);
      }
    } catch (err) {
      console.error('Error fetching all issuers:', err);
    } finally {
      setLoadingIssuers(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchIssuers();
  }, [token]);

  const handleAccreditNewIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newInstName.trim() || !newInstCode.trim()) {
      setError('Please provide institution name and accreditation code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/issuers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newInstName.trim(),
          accreditation_code: newInstCode.trim().toUpperCase(),
          country: newInstCountry.trim().toUpperCase(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Accreditation failed.');
      }

      await fetchIssuers();
      await fetchHealth();
      setNewInstName('');
      setNewInstCode('');
    } catch (err: any) {
      setError(err.message || 'Error accrediting institution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccreditation = async (issuerId: string) => {
    if (!confirm('Are you sure you want to revoke this institution\'s accreditation?')) return;
    try {
      const res = await fetch(`${API_BASE}/issuers/revoke-accreditation/${issuerId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchIssuers();
        await fetchHealth();
      }
    } catch (err) {
      console.error('Error revoking accreditation:', err);
    }
  };

  const handleReaccredit = async (issuerId: string) => {
    try {
      const res = await fetch(`${API_BASE}/issuers/accredit/${issuerId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchIssuers();
        await fetchHealth();
      }
    } catch (err) {
      console.error('Error accrediting issuer:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-10">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                ADMIN GOVERNANCE ROLE
              </span>
              <span className="text-xs uppercase text-gray-300">ID: {user?.id}</span>
            </div>
            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              ADMIN GOVERNANCE CONSOLE
            </h1>
            <p className="text-xs uppercase text-gray-300">
              AUTHENTICATED GOVERNANCE ADMINISTRATOR: <strong>{user?.full_name}</strong> ({user?.email})
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

        {/* Live EVM Blockchain Monitor Widget */}
        <TransactionMonitor />

        {/* System Health Telemetry Bar */}
        {healthData && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#131313] pb-3">
              <div className="flex items-center gap-2 font-bold text-xs uppercase text-[#131313]">
                <Activity className="w-4 h-4 text-[#FF5C00]" />
                <span>SYSTEM HEALTH & DATABASE METRICS</span>
              </div>
              <span className="bg-[#131313] text-[#FF5C00] text-[10px] font-bold px-2 py-0.5 uppercase">
                {healthData.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-[#EAE9E4] p-4 border border-[#131313]">
                <span className="text-gray-600 text-[10px] block uppercase font-bold">TOTAL REGISTERED USERS</span>
                <span className="text-xl font-bold text-[#131313]">{healthData.metrics.total_users}</span>
              </div>

              <div className="bg-[#EAE9E4] p-4 border border-[#131313]">
                <span className="text-gray-600 text-[10px] block uppercase font-bold">ISSUED CREDENTIALS</span>
                <span className="text-xl font-bold text-[#131313]">{healthData.metrics.total_credentials}</span>
              </div>

              <div className="bg-[#EAE9E4] p-4 border border-[#131313]">
                <span className="text-gray-600 text-[10px] block uppercase font-bold">REVOKED CREDENTIALS</span>
                <span className="text-xl font-bold text-red-600">{healthData.metrics.revoked_credentials}</span>
              </div>

              <div className="bg-[#EAE9E4] p-4 border border-[#131313]">
                <span className="text-gray-600 text-[10px] block uppercase font-bold">ACCREDITED ISSUERS</span>
                <span className="text-xl font-bold text-[#FF5C00]">{healthData.metrics.accredited_issuers}</span>
              </div>
            </div>
          </div>
        )}

        {/* Issuer Accreditation Manager Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Column */}
          <form onSubmit={handleAccreditNewIssuer} className="lg:col-span-5 bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
            <div className="border-b border-[#131313] pb-4">
              <h2 className="font-anton text-2xl uppercase text-[#131313] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FF5C00]" />
                <span>ACCREDIT NEW UNIVERSITY</span>
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
                UNIVERSITY / INSTITUTION NAME *
              </label>
              <input
                type="text"
                required
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">
                ACCREDITATION CODE *
              </label>
              <input
                type="text"
                required
                value={newInstCode}
                onChange={(e) => setNewInstCode(e.target.value)}
                placeholder="e.g. ACC-2026-STANFORD"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">
                COUNTRY / JURISDICTION *
              </label>
              <input
                type="text"
                required
                value={newInstCountry}
                onChange={(e) => setNewInstCountry(e.target.value)}
                placeholder="UNITED STATES"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase py-4 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-[#FF5C00]" />
              <span>{isSubmitting ? 'ACCREDITING...' : 'GRANT ISSUER ACCREDITATION'}</span>
            </button>
          </form>

          {/* Issuers Roster Display Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#131313] pb-3">
                <h2 className="font-anton text-2xl uppercase text-[#131313]">
                  ACCREDITED ISSUERS REGISTRY ({issuers.length})
                </h2>
              </div>

              {loadingIssuers ? (
                <div className="p-8 text-center text-xs font-bold uppercase animate-pulse">
                  LOADING ISSUERS REGISTRY...
                </div>
              ) : issuers.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold uppercase text-gray-600">
                  No issuers registered in the system yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {issuers.map((inst) => (
                    <div
                      key={inst.id}
                      className={`p-5 border-2 flex justify-between items-center gap-4 ${
                        inst.is_verified ? 'bg-[#131313] text-white border-[#131313]' : 'bg-red-100 border-red-500 text-red-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 uppercase ${
                            inst.is_verified ? 'bg-[#FF5C00] text-[#131313]' : 'bg-red-600 text-white'
                          }`}>
                            {inst.is_verified ? 'VERIFIED ACCREDITED' : 'ACCREDITATION REVOKED'}
                          </span>
                          <span className="text-[10px] font-bold uppercase opacity-80">{inst.accreditation_code}</span>
                        </div>

                        <h3 className="font-archivo font-bold text-base uppercase">
                          {inst.name}
                        </h3>

                        <p className="text-[10px] opacity-80">JURISDICTION: {inst.country}</p>
                      </div>

                      {inst.is_verified ? (
                        <button
                          onClick={() => handleRevokeAccreditation(inst.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase px-3 py-2 border border-[#131313] transition-colors cursor-pointer shrink-0"
                        >
                          REVOKE
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReaccredit(inst.id)}
                          className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono text-[10px] font-bold uppercase px-3 py-2 border border-[#131313] transition-colors cursor-pointer shrink-0"
                        >
                          ACCREDIT
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
