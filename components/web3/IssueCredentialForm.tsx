'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { CREDENTIAL_REGISTRY_ADDRESS, CREDENTIAL_REGISTRY_ABI } from '@/web3/contracts';
import { Building2, ShieldCheck, CheckCircle2, Copy, AlertTriangle } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#113221]/10">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#113221] flex items-center justify-center text-white">
          <Building2 className="w-6 h-6 text-[#E85D34]" />
        </div>
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-[#113221]">
            Issue Academic Credential
          </h2>
          <p className="text-xs font-inter text-[#113221]/70">
            Register cryptographically hashed credential commitments on-chain. Zero PII stored on blockchain.
          </p>
        </div>
      </div>

      {!isConnected ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 text-sm font-inter flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Please connect your issuing institution wallet using the <strong>Connect Wallet</strong> button in the top header before proceeding.</span>
        </div>
      ) : (
        <form onSubmit={handleCreateCredential} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#113221] mb-2">
                Credential / Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
                placeholder="e.g. EDU-2026-001"
              />
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#113221] mb-2">
                Degree / Qualification
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#113221] mb-2">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
                placeholder="8.50"
              />
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#113221] mb-2">
                Total Credits Earned
              </label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
                placeholder="142"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#113221] mb-2">
              Student Wallet Address (Optional)
            </label>
            <input
              type="text"
              value={studentWallet}
              onChange={(e) => setStudentWallet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
              placeholder="0x... (Defaults to your connected wallet if empty)"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full bg-[#113221] hover:bg-[#1a442e] text-white font-montserrat font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5 text-[#E85D34]" />
              <span>
                {isPending
                  ? 'Awaiting MetaMask Approval...'
                  : isConfirming
                  ? 'Confirming On-Chain Transaction...'
                  : 'Register Credential On-Chain'}
              </span>
            </button>
          </div>
        </form>
      )}

      {hash && (
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-[#113221] space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 font-montserrat font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Transaction Broadcasted to Blockchain!</span>
          </div>

          <p className="text-xs font-mono break-all text-gray-700 bg-white p-3 rounded-lg border border-emerald-100">
            <strong>Tx Hash:</strong> {hash}
          </p>

          {isConfirming && (
            <p className="text-xs font-inter text-emerald-700 animate-pulse">
              Waiting for block confirmation on Anvil Local Devnet...
            </p>
          )}

          {isConfirmed && (
            <div className="mt-4 pt-4 border-t border-emerald-200 space-y-4">
              <span className="inline-block bg-emerald-600 text-white font-montserrat text-xs font-bold px-3 py-1 rounded-full">
                ✓ CONFIRMED ON-CHAIN
              </span>

              {generatedPayload && (
                <div className="bg-[#113221] text-[#F8F7F3] p-4 rounded-xl font-mono text-xs space-y-2 relative">
                  <div className="flex justify-between items-center text-gray-400 border-b border-gray-700 pb-2">
                    <span>Off-Chain Credential Payload (Keep Confidential)</span>
                    <button
                      onClick={() => copyToClipboard(generatedPayload.rawJson)}
                      className="flex items-center space-x-1 text-emerald-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPayload ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <div><strong>Credential ID (bytes32):</strong> {generatedPayload.credentialIdBytes32}</div>
                  <div><strong>Commitment Hash (bytes32):</strong> {generatedPayload.commitmentBytes32}</div>
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
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs font-mono space-y-1">
          <strong>Transaction Error:</strong>
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
    return <div className="max-w-3xl mx-auto bg-white rounded-3xl p-12 shadow-xl border border-[#113221]/10 min-h-[300px] animate-pulse" />;
  }

  return <IssueCredentialFormInner />;
}
