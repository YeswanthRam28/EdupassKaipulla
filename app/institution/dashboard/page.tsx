'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import IssueCredentialForm from '@/components/web3/IssueCredentialForm';
import { useAuth } from '@/lib/auth/context';
import { Building2, LogOut, Users, FileText, Trash2, CheckCircle2, XCircle, Search, ShieldAlert, Hash } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function InstitutionDashboardContent() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ISSUE' | 'ROSTER' | 'AUDIT'>('ISSUE');
  
  // Roster State
  const [students, setStudents] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Audit Logs & Revocation State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const institutionCode = user?.institution_id || `INST-2026-${user?.wallet_address?.slice(-4).toUpperCase() || 'VEDANTH'}`;

  // Fetch Registered Student Roster
  useEffect(() => {
    async function fetchRoster() {
      if (!token || activeTab !== 'ROSTER') return;
      setLoadingRoster(true);
      try {
        const res = await fetch(`${API_BASE}/users/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error('Error fetching student roster:', err);
      } finally {
        setLoadingRoster(false);
      }
    }
    fetchRoster();
  }, [token, activeTab]);

  // Fetch Audit Logs
  useEffect(() => {
    async function fetchAudit() {
      if (!token || activeTab !== 'AUDIT') return;
      setLoadingAudit(true);
      try {
        const res = await fetch(`${API_BASE}/credentials/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(data);
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoadingAudit(false);
      }
    }
    fetchAudit();
  }, [token, activeTab]);

  const handleRevokeCredential = async (credId: string) => {
    if (!confirm('Are you sure you want to revoke this academic credential? This action will mark it as REVOKED.')) {
      return;
    }

    setRevokingId(credId);
    try {
      const res = await fetch(`${API_BASE}/credentials/revoke/${credId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Revocation failed');
      }

      const updated = await res.json();
      setAuditLogs((prev) => prev.map((c) => (c.id === credId ? updated : c)));
    } catch (err: any) {
      alert(`Could not revoke credential: ${err.message || 'Error'}`);
    } finally {
      setRevokingId(null);
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
                INSTITUTION ISSUER ROLE
              </span>
              <div className="bg-[#222222] text-[#FF5C00] px-3 py-1 text-xs font-bold uppercase flex items-center gap-1 border border-[#333333]">
                <Hash className="w-3.5 h-3.5" />
                <span>INSTITUTION ID: {institutionCode}</span>
              </div>
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              INSTITUTION DASHBOARD
            </h1>
            <p className="text-xs uppercase text-gray-300">
              AUTHENTICATED ISSUER: <strong>{user?.full_name}</strong> ({user?.wallet_address || user?.email})
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

        {/* Governance Navigation Tabs */}
        <div className="flex flex-wrap border-2 border-[#131313] bg-[#E2E1DC]">
          <button
            onClick={() => setActiveTab('ISSUE')}
            className={`flex-1 min-w-[200px] py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ISSUE' ? 'bg-[#131313] text-white' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#FF5C00]" />
            <span>ISSUE CREDENTIAL</span>
          </button>

          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`flex-1 min-w-[200px] py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ROSTER' ? 'bg-[#131313] text-white' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Users className="w-4 h-4 text-[#FF5C00]" />
            <span>REGISTERED STUDENTS ROSTER</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex-1 min-w-[200px] py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'AUDIT' ? 'bg-[#131313] text-white' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#FF5C00]" />
            <span>REVOCATION & AUDIT LOGS</span>
          </button>
        </div>

        {/* TAB 1: ISSUANCE FORM */}
        {activeTab === 'ISSUE' && <IssueCredentialForm />}

        {/* TAB 2: REGISTERED STUDENTS ROSTER */}
        {activeTab === 'ROSTER' && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#131313] pb-4">
              <h2 className="font-anton text-2xl uppercase text-[#131313]">
                REGISTERED STUDENT ROSTER ({students.length})
              </h2>
            </div>

            {loadingRoster ? (
              <div className="p-12 text-center text-xs font-bold uppercase animate-pulse">
                LOADING REGISTERED STUDENTS ROSTER...
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold uppercase text-gray-600">
                No student accounts registered in the database yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#131313]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#131313] text-white uppercase text-[11px]">
                    <tr>
                      <th className="p-4 border-b border-[#131313]">STUDENT ID</th>
                      <th className="p-4 border-b border-[#131313]">STUDENT NAME</th>
                      <th className="p-4 border-b border-[#131313]">INSTITUTION</th>
                      <th className="p-4 border-b border-[#131313]">WALLET ADDRESS</th>
                      <th className="p-4 border-b border-[#131313]">EMAIL IDENTITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131313] bg-[#EAE9E4]">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-white transition-colors">
                        <td className="p-4 font-bold text-[#FF5C00] uppercase">
                          {st.student_id || `EDU-2026-${st.wallet_address?.slice(-4).toUpperCase() || '9283'}`}
                        </td>
                        <td className="p-4 font-bold text-[#131313] uppercase">{st.full_name}</td>
                        <td className="p-4 font-bold text-[#131313] uppercase">{st.institution_name || 'EduPass Consortium'}</td>
                        <td className="p-4 font-mono text-[11px] text-gray-700">{st.wallet_address || 'NOT LINKED'}</td>
                        <td className="p-4 text-gray-600">{st.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT LOGS & REVOCATION */}
        {activeTab === 'AUDIT' && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#131313] pb-4">
              <h2 className="font-anton text-2xl uppercase text-[#131313]">
                INSTITUTION ISSUANCE AUDIT LOGS ({auditLogs.length})
              </h2>
            </div>

            {loadingAudit ? (
              <div className="p-12 text-center text-xs font-bold uppercase animate-pulse">
                LOADING AUDIT LOGS...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold uppercase text-gray-600">
                No issuance audit records found.
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-6 border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      log.is_revoked ? 'bg-red-100 border-red-500 text-red-900' : 'bg-[#131313] text-white border-[#131313]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                          log.is_revoked ? 'bg-red-600 text-white' : 'bg-[#FF5C00] text-[#131313]'
                        }`}>
                          {log.is_revoked ? 'REVOKED' : 'ACTIVE'}
                        </span>
                        <span className="text-xs font-bold uppercase opacity-80">STUDENT ID: {log.student_id}</span>
                      </div>

                      <h3 className="font-anton text-xl uppercase tracking-tight">
                        {log.degree} ({log.cgpa} CGPA)
                      </h3>

                      <p className="text-xs uppercase opacity-80">
                        STUDENT: <strong>{log.student_name}</strong> | ISSUED: {new Date(log.issued_at).toLocaleString()}
                      </p>

                      <p className="font-mono text-[10px] opacity-70 break-all">
                        HASH: {log.commitment_hash}
                      </p>
                    </div>

                    {!log.is_revoked && (
                      <button
                        onClick={() => handleRevokeCredential(log.id)}
                        disabled={revokingId === log.id}
                        className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase px-4 py-2 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        <span>{revokingId === log.id ? 'REVOKING...' : 'REVOKE CREDENTIAL'}</span>
                      </button>
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

export default function InstitutionDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['INSTITUTION', 'ADMIN']}>
      <InstitutionDashboardContent />
    </ProtectedRoute>
  );
}
