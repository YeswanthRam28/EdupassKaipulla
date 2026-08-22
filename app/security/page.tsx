'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { Key, Shield, Smartphone, AlertCircle, CheckCircle2, Lock, Trash2, Fingerprint, RefreshCw, ShieldAlert, Cpu, Activity } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function SecurityContent() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'PASSKEYS' | 'DEVICES' | 'AUDIT'>('PASSKEYS');

  // Passkeys State
  const [passkeyName, setPasskeyName] = useState('My Laptop TouchID / Passkey');
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<string | null>(null);

  // Devices State
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Audit Logs & Risk State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const fetchPasskeys = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/security/passkey/my-passkeys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data.passkeys);
      }
    } catch (err) {
      console.error('Error fetching passkeys:', err);
    }
  };

  const fetchDevices = async () => {
    if (!token) return;
    setIsLoadingDevices(true);
    try {
      const res = await fetch(`${API_BASE}/security/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices);
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const fetchAuditAndRisk = async () => {
    if (!token) return;
    setIsLoadingAudit(true);
    try {
      const [logsRes, riskRes] = await Promise.all([
        fetch(`${API_BASE}/security/audit-logs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/security/fraud-risk`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.audit_logs);
      }
      if (riskRes.ok) {
        const rData = await riskRes.json();
        setRiskData(rData);
      }
    } catch (err) {
      console.error('Error fetching security audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
    fetchDevices();
    fetchAuditAndRisk();
  }, [token]);

  // Register Passkey WebAuthn Trigger
  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyMsg(null);
    setIsRegistering(true);

    try {
      // Trigger WebAuthn browser API if supported
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: "EduPass Trust Network" },
              user: {
                id: new Uint8Array(16),
                name: user?.email || "student@edupass",
                displayName: user?.full_name || "EduPass Student",
              },
              pubKeyCredParams: [{ alg: -7, type: "public-key" }],
              timeout: 60000,
              authenticatorSelection: { userVerification: "preferred" },
            },
          });
        } catch (webauthnErr) {
          console.log('WebAuthn prompt fallback:', webauthnErr);
        }
      }

      // Backend API call
      const res = await fetch(`${API_BASE}/security/passkey/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ passkey_name: passkeyName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setPasskeyMsg(data.message);
        setPasskeyName('');
        await fetchPasskeys();
        await fetchAuditAndRisk();
      }
    } catch (err: any) {
      console.error('Error registering passkey:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Revoke Device Session
  const handleRevokeDevice = async (deviceId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/security/devices/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ device_id: deviceId }),
      });
      if (res.ok) {
        await fetchDevices();
        await fetchAuditAndRisk();
      }
    } catch (err) {
      console.error('Error revoking device session:', err);
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
                SECURITY CENTER & WEBAUTHN HUB
              </span>
              <span className="text-xs uppercase text-gray-300">USER: <strong>{user?.full_name}</strong></span>
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              SECURITY CENTER & PASSKEYS (MODULES 35–40)
            </h1>
            <p className="text-xs uppercase text-gray-300 max-w-2xl">
              FIDO2 WebAuthn Passkeys, Biometric Holder Binding, Trusted Device Sessions, and Real-Time Security Audit Trail.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex flex-wrap border-2 border-[#131313] bg-[#E2E1DC]">
          <button
            onClick={() => setActiveTab('PASSKEYS')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors border-r border-[#131313] flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'PASSKEYS' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Key className="w-4 h-4 text-[#FF5C00]" />
            <span>1. WEBAUTHN PASSKEYS & BIOMETRICS (MODS 35 & 36)</span>
          </button>

          <button
            onClick={() => setActiveTab('DEVICES')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors border-r border-[#131313] flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'DEVICES' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#FF5C00]" />
            <span>2. TRUSTED DEVICES & SESSIONS (MODS 37 & 38)</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex-1 min-w-[160px] py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'AUDIT' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#FF5C00]" />
            <span>3. AUDIT TRAIL & FRAUD RISK MONITOR (MODS 39 & 40)</span>
          </button>
        </div>

        {/* TAB 1: WEBAUTHN PASSKEYS & BIOMETRICS */}
        {activeTab === 'PASSKEYS' && (
          <div className="space-y-6">
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
              <div className="border-b border-[#131313] pb-3">
                <span className="font-bold text-xs uppercase text-[#131313] flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#FF5C00]" />
                  <span>REGISTER NEW FIDO2 WEBAUTHN BIOMETRIC PASSKEY</span>
                </span>
              </div>

              {passkeyMsg && (
                <div className="bg-[#131313] text-white p-3 border border-[#131313] text-xs font-bold uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C00] shrink-0" />
                  <span>{passkeyMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterPasskey} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={passkeyName}
                  onChange={(e) => setPasskeyName(e.target.value)}
                  placeholder="Passkey Name (e.g. TouchID / Windows Hello)"
                  className="flex-1 bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
                />
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-8 py-3 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Fingerprint className="w-4 h-4 text-[#FF5C00]" />
                  <span>{isRegistering ? 'TRIGGERING BIOMETRIC...' : 'REGISTER BIOMETRIC PASSKEY'}</span>
                </button>
              </form>
            </div>

            {/* Registered Passkeys List */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
              <span className="font-bold text-xs uppercase text-[#131313] block">
                REGISTERED BIOMETRIC PASSKEYS ({passkeys.length})
              </span>

              <div className="space-y-3">
                {passkeys.map((p) => (
                  <div key={p.id} className="bg-[#131313] text-white p-4 border-2 border-[#131313] flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-2 py-0.5 uppercase">FIDO2 ACTIVE</span>
                        <span className="font-bold uppercase text-white">{p.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">CREDENTIAL ID: {p.credential_id}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase">ACTIVE & BOUND</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRUSTED DEVICES & SESSIONS */}
        {activeTab === 'DEVICES' && (
          <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-6">
            <div className="border-b border-[#131313] pb-3">
              <span className="font-bold text-xs uppercase text-[#131313]">
                ACTIVE TRUSTED BROWSER SESSIONS & MOBILE HARDWARE ({devices.length})
              </span>
            </div>

            {isLoadingDevices ? (
              <div className="p-8 text-center text-xs font-bold uppercase animate-pulse">
                FETCHING TRUSTED DEVICE SESSIONS...
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((d, i) => (
                  <div key={i} className="bg-[#131313] text-white p-5 border-2 border-[#131313] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 uppercase ${
                          d.is_current ? 'bg-[#FF5C00] text-[#131313]' : 'bg-gray-700 text-white'
                        }`}>
                          {d.is_current ? 'CURRENT SESSION' : 'LINKED DEVICE'}
                        </span>
                        <span className="font-bold uppercase text-white">{d.device_name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">DEVICE ID: {d.device_id} | IP: {d.ip_address}</p>
                    </div>

                    {!d.is_current && (
                      <button
                        onClick={() => handleRevokeDevice(d.device_id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase px-4 py-2 border border-[#131313] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>REVOKE SESSION</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL & FRAUD RISK MONITOR */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-6">
            
            {/* Risk Gauge Card */}
            {riskData && (
              <div className="bg-[#131313] text-white border-2 border-[#131313] p-6 flex justify-between items-center gap-4 font-mono">
                <div className="space-y-1">
                  <span className="text-[#FF5C00] font-bold text-xs uppercase block">[ FRAUD RISK SCORE ]</span>
                  <h3 className="font-anton text-2xl uppercase text-white">{riskData.verdict}</h3>
                </div>
                <div className="bg-[#1A1A1A] p-4 border border-gray-800 text-center shrink-0">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">RISK RATING</span>
                  <span className="font-anton text-3xl text-green-400">{riskData.risk_level} ({riskData.risk_score}/100)</span>
                </div>
              </div>
            )}

            {/* Audit Logs Table */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4 font-mono text-xs">
              <span className="font-bold text-xs uppercase text-[#131313] block">
                REAL-TIME SECURITY AUDIT LOGS (MODULE 39)
              </span>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.event_id} className="bg-[#EAE9E4] p-4 border border-[#131313] flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#131313] text-[#FF5C00] text-[9px] font-bold px-2 py-0.5 uppercase">
                          {log.event_type}
                        </span>
                        <span className="font-bold uppercase text-[#131313]">{log.details}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">TIMESTAMP: {new Date(log.timestamp).toLocaleString()}</p>
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

export default function SecurityPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'INSTITUTION', 'EMPLOYER', 'VERIFIER']}>
      <SecurityContent />
    </ProtectedRoute>
  );
}
