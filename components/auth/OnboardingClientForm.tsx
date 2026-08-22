'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/lib/auth/context';
import { PUBLIC_ROLES, getDashboardForRole } from '@/lib/auth/roles';
import { PublicUserRole } from '@/lib/auth/types';
import { ShieldCheck, UserCheck, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import ConnectWallet from '@/components/web3/ConnectWallet';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OnboardingClientForm() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const paramWallet = searchParams.get('wallet');
  
  const activeWallet = address || paramWallet || '';

  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<PublicUserRole>('STUDENT');
  const [studentId, setStudentId] = useState('EDU-2026-0687');
  const [selectedInstitution, setSelectedInstitution] = useState('ACC-2026-EDUPASS');
  const [customInstitutionName, setCustomInstitutionName] = useState('Stanford University');
  const [accreditedIssuers, setAccreditedIssuers] = useState<any[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { walletOnboard, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Fetch accredited issuers list
  useEffect(() => {
    async function fetchIssuers() {
      try {
        const res = await fetch(`${API_BASE}/issuers/`);
        if (res.ok) {
          const data = await res.json();
          setAccreditedIssuers(data);
        }
      } catch (err) {
        console.error('Could not fetch issuers:', err);
      }
    }
    fetchIssuers();
  }, []);

  // Pre-fill Student ID based on wallet address snippet
  useEffect(() => {
    if (activeWallet && selectedRole === 'STUDENT' && (!studentId || studentId === 'EDU-2026-9283')) {
      const walletSnippet = activeWallet.slice(-4).toUpperCase();
      setStudentId(`EDU-2026-${walletSnippet}`);
    }
  }, [activeWallet, selectedRole]);

  // If already authenticated with a role, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      router.push(getDashboardForRole(user.role));
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeWallet) {
      setError('Please connect your Web3 wallet to complete onboarding.');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const instObj = accreditedIssuers.find(i => i.accreditation_code === selectedInstitution);
      const instName = instObj ? instObj.name : customInstitutionName.trim();
      const instId = instObj ? instObj.accreditation_code : `INST-${selectedInstitution.toUpperCase()}`;

      const onboardedUser = await walletOnboard({
        wallet_address: activeWallet,
        full_name: fullName.trim(),
        role: selectedRole,
        student_id: selectedRole === 'STUDENT' ? studentId.trim() : undefined,
        institution_id: selectedRole === 'STUDENT' ? instId : `INST-2026-${activeWallet.slice(-4).toUpperCase()}`,
        institution_name: selectedRole === 'STUDENT' ? instName : fullName.trim(),
      });

      const targetDashboard = getDashboardForRole(onboardedUser.role);
      router.push(targetDashboard);
    } catch (err: any) {
      setError(err.message || 'Could not complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#E2E1DC] border-2 border-[#131313] p-8 md:p-12 space-y-8 font-mono">
      {/* Header Banner */}
      <div className="border-b border-[#131313] pb-6 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-xs font-bold text-[#FF5C00] uppercase tracking-widest block">
              [ FIRST-TIME WALLET ONBOARDING ]
            </span>
            <h1 className="font-anton text-3xl md:text-5xl uppercase text-[#131313] tracking-tight mt-1">
              WELCOME TO EDUPASS
            </h1>
          </div>

          {activeWallet ? (
            <div className="bg-[#131313] text-white px-3 py-1.5 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 border border-[#131313] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span>{activeWallet.slice(0, 6)}...{activeWallet.slice(-4)}</span>
            </div>
          ) : (
            <ConnectWallet />
          )}
        </div>

        <p className="text-xs uppercase text-[#333333]">
          Your wallet is connected. Please complete your profile to access your decentralized dashboard.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-mono uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Full Name Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
            1. FULL NAME / ORGANIZATIONAL IDENTITY *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe or Stanford University"
            className="w-full bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase"
          />
        </div>

        {/* Account Role Selector Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
            2. SELECT YOUR ACCOUNT ROLE *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PUBLIC_ROLES.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected 
                      ? 'bg-[#131313] text-white border-[#131313]' 
                      : 'bg-[#EAE9E4] text-[#131313] border-[#131313] hover:border-[#FF5C00]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-archivo font-bold text-lg uppercase ${isSelected ? 'text-[#FF5C00]' : 'text-[#131313]'}`}>
                      {r.label}
                    </span>
                    {isSelected && (
                      <UserCheck className="w-5 h-5 text-[#FF5C00]" />
                    )}
                  </div>
                  <p className={`text-[11px] uppercase leading-relaxed ${isSelected ? 'text-gray-300' : 'text-[#333333]'}`}>
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student ID & Institution input if role is STUDENT */}
        {selectedRole === 'STUDENT' && (
          <div className="space-y-6 pt-4 border-t border-[#131313]">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313]">
                3. ASSIGN YOUR ACADEMIC STUDENT ID
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. EDU-2026-0687"
                className="w-full bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase font-bold"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#FF5C00]" />
                <span>4. SELECT YOUR EDUCATIONAL INSTITUTION / UNIVERSITY *</span>
              </label>
              
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase font-bold"
              >
                {accreditedIssuers.map((i) => (
                  <option key={i.id} value={i.accreditation_code}>
                    {i.name} ({i.accreditation_code})
                  </option>
                ))}
                <option value="OTHER">OTHER / UNLISTED INSTITUTION</option>
              </select>

              {selectedInstitution === 'OTHER' && (
                <input
                  type="text"
                  required
                  value={customInstitutionName}
                  onChange={(e) => setCustomInstitutionName(e.target.value)}
                  placeholder="Enter Institution Name or Code (e.g. Stanford University)"
                  className="w-full bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs text-[#131313] focus:outline-none focus:border-[#FF5C00] uppercase"
                />
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !activeWallet}
          className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <span>{isSubmitting ? 'SAVING PROFILE & ROUTING...' : 'COMPLETE ONBOARDING & ENTER DASHBOARD'}</span>
          <ArrowRight className="w-4 h-4 text-[#FF5C00]" />
        </button>
      </form>
    </div>
  );
}
