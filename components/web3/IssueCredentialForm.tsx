'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { CREDENTIAL_REGISTRY_ADDRESS, CREDENTIAL_REGISTRY_ABI } from '@/web3/contracts';
import { ShieldCheck, CheckCircle2, Copy, AlertTriangle, Building2 } from 'lucide-react';

function IssueCredentialFormInner() {
  const { isConnected, address } = useAccount();
  
  const [studentId, setStudentId] = useState('EDU-2026-9283');
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [cgpa, setCgpa] = useState('8.47');
  const [credits, setCredits] = useState('142');
  const [studentWallet, setStudentWallet] = useState('');
  
  const [generatedPayload, setGeneratedPayload] = useState<any>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your institution wallet first.');
      return;
    }

    const payload = {
      credentialId: studentId.trim(),
      issuer: address,
      studentWallet: studentWallet.trim() || address,
      degree: degree.trim(),
      cgpa: parseFloat(cgpa),
      credits: parseInt(credits, 10),
      issuedAt: new Date().toISOString(),
    };

    const credentialIdBytes32 = keccak256(stringToBytes(payload.credentialId));
    const payloadJsonString = JSON.stringify(payload);
    const commitmentBytes32 = keccak256(stringToBytes(payloadJsonString));

    setGeneratedPayload({
      ...payload,
      credentialIdBytes32,
      commitmentBytes32,
      rawJson: payloadJsonString,
    });

    writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: 'registerCredential',
      args: [credentialIdBytes32, commitmentBytes32],
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
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

      {!isConnected ? (
        <div className="bg-[#FF5C00] border border-[#131313] p-6 text-[#131313] text-xs font-mono uppercase flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>PLEASE CONNECT YOUR INSTITUTION WALLET USING THE CONNECT WALLET BUTTON BEFORE PROCEEDING.</span>
        </div>
      ) : (
        <form onSubmit={handleCreateCredential} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
                Credential / Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
                placeholder="e.g. EDU-2026-001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
                Degree / Qualification
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
                CGPA (10-Point Scale)
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
                placeholder="8.50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
                Total Credits Earned
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
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#131313] mb-2">
              Student Wallet Address (Optional)
            </label>
            <input
              type="text"
              value={studentWallet}
              onChange={(e) => setStudentWallet(e.target.value)}
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
              placeholder="0x... (Defaults to issuer wallet if empty)"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest py-4 border border-[#131313] transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isPending
                  ? 'AWAITING METAMASK APPROVAL...'
                  : isConfirming
                  ? 'CONFIRMING ON-CHAIN TRANSACTION...'
                  : 'REGISTER CREDENTIAL ON-CHAIN'}
              </span>
            </button>
          </div>
        </form>
      )}

      {hash && (
        <div className="bg-[#EAE9E4] border border-[#131313] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 font-bold uppercase text-[#131313]">
            <CheckCircle2 className="w-4 h-4 text-[#FF5C00]" />
            <span>TRANSACTION BROADCASTED TO BLOCKCHAIN</span>
          </div>

          <p className="break-all bg-[#E2E2E2] p-3 border border-[#131313]">
            <strong>TX HASH:</strong> {hash}
          </p>

          {isConfirming && (
            <p className="text-[#FF5C00] font-bold uppercase animate-pulse">
              WAITING FOR BLOCK CONFIRMATION...
            </p>
          )}

          {isConfirmed && (
            <div className="pt-4 border-t border-[#131313] space-y-4">
              <span className="inline-block bg-[#131313] text-white font-mono text-xs font-bold px-3 py-1 border border-[#131313] uppercase">
                ✓ CONFIRMED ON-CHAIN
              </span>

              {generatedPayload && (
                <div className="bg-[#131313] text-white p-4 border border-[#131313] font-mono text-xs space-y-2 relative">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-[#FF5C00] font-bold uppercase">OFF-CHAIN PAYLOAD (KEEP CONFIDENTIAL)</span>
                    <button
                      onClick={() => copyToClipboard(generatedPayload.rawJson)}
                      className="flex items-center space-x-1 text-white hover:text-[#FF5C00] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPayload ? 'COPIED!' : 'COPY JSON'}</span>
                    </button>
                  </div>
                  <div><strong>CREDENTIAL ID:</strong> {generatedPayload.credentialIdBytes32}</div>
                  <div><strong>COMMITMENT HASH:</strong> {generatedPayload.commitmentBytes32}</div>
                  <pre className="text-gray-300 overflow-x-auto text-[11px] pt-2">
                    {JSON.stringify(generatedPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-500 p-4 text-red-900 text-xs font-mono space-y-1">
          <strong>TRANSACTION ERROR:</strong>
          <p>{error.message}</p>
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
