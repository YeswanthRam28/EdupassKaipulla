'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { CREDENTIAL_REGISTRY_ADDRESS, CREDENTIAL_REGISTRY_ABI } from '@/web3/contracts';
import { Search, ShieldAlert, CheckCircle2, XCircle, Key, Trash2 } from 'lucide-react';

function VerifyCredentialCardInner() {
  const { address } = useAccount();
  const [searchId, setSearchId] = useState('EDU-2026-9283');
  const [queryCredentialIdBytes32, setQueryCredentialIdBytes32] = useState<`0x${string}` | null>(null);
  
  const [offChainPayload, setOffChainPayload] = useState('');
  const [payloadMatchStatus, setPayloadMatchStatus] = useState<'MATCH' | 'MISMATCH' | 'NONE'>('NONE');

  const { data: credentialData, isLoading } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'getCredential',
    args: queryCredentialIdBytes32 ? [queryCredentialIdBytes32] : undefined,
    query: {
      enabled: !!queryCredentialIdBytes32,
    },
  });

  const { data: revokeTxHash, isPending: isRevoking, writeContract: revokeContract } = useWriteContract();
  const { isSuccess: isRevokeConfirmed } = useWaitForTransactionReceipt({ hash: revokeTxHash });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    let targetBytes32: `0x${string}`;
    if (searchId.trim().startsWith('0x') && searchId.trim().length === 66) {
      targetBytes32 = searchId.trim() as `0x${string}`;
    } else {
      targetBytes32 = keccak256(stringToBytes(searchId.trim()));
    }

    setQueryCredentialIdBytes32(targetBytes32);
    setPayloadMatchStatus('NONE');
  };

  const handleVerifyOffChainPayload = () => {
    if (!offChainPayload.trim() || !credentialData) return;
    try {
      const computedCommitment = keccak256(stringToBytes(offChainPayload.trim()));
      const onChainCommitment = credentialData[1];
      if (computedCommitment.toLowerCase() === onChainCommitment.toLowerCase()) {
        setPayloadMatchStatus('MATCH');
      } else {
        setPayloadMatchStatus('MISMATCH');
      }
    } catch (err) {
      alert('Invalid JSON or string payload provided.');
    }
  };

  const handleRevoke = () => {
    if (!queryCredentialIdBytes32) return;
    if (confirm('Are you sure you want to revoke this academic credential on-chain? This action cannot be undone.')) {
      revokeContract({
        address: CREDENTIAL_REGISTRY_ADDRESS,
        abi: CREDENTIAL_REGISTRY_ABI,
        functionName: 'revokeCredential',
        args: [queryCredentialIdBytes32],
      });
    }
  };

  const issuerAddress = credentialData ? credentialData[0] : null;
  const commitmentHash = credentialData ? credentialData[1] : null;
  const issuedAtTimestamp = credentialData ? Number(credentialData[2]) : 0;
  const isActive = credentialData ? credentialData[3] : false;
  const exists = issuedAtTimestamp > 0;
  const isCurrentIssuer = address && issuerAddress && address.toLowerCase() === issuerAddress.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#113221]/10 space-y-8">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#113221] flex items-center justify-center text-white">
            <Search className="w-6 h-6 text-[#E85D34]" />
          </div>
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-[#113221]">
              Public Credential Verification Portal
            </h2>
            <p className="text-xs font-inter text-[#113221]/70">
              Query on-chain smart contract status and verify tamper-proof payload integrity instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Credential ID (e.g. EDU-2026-9283 or 0x...)"
            required
            className="flex-1 px-4 py-3.5 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
          />
          <button
            type="submit"
            className="bg-[#113221] hover:bg-[#1a442e] text-white font-montserrat font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md"
          >
            Query On-Chain
          </button>
        </form>
      </div>

      {queryCredentialIdBytes32 && (
        <div className="pt-6 border-t border-gray-200">
          {isLoading && (
            <div className="text-center py-8 text-sm font-montserrat text-gray-500 animate-pulse">
              Fetching credential record from EVM smart contract...
            </div>
          )}

          {!isLoading && !exists && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-montserrat font-bold text-gray-800">Credential Not Found</h3>
              <p className="text-xs font-inter text-gray-500 max-w-md mx-auto">
                No credential matching hash <code>{queryCredentialIdBytes32}</code> has been registered on this blockchain.
              </p>
            </div>
          )}

          {!isLoading && exists && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center space-x-3">
                  {isActive ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-montserrat font-bold text-lg">
                      {isActive ? 'AUTHENTIC & ACTIVE CREDENTIAL' : 'REVOKED CREDENTIAL'}
                    </h3>
                    <p className="text-xs opacity-80">
                      {isActive ? 'This credential commitment is verified active on the EVM registry.' : 'This credential has been revoked by the issuing institution.'}
                    </p>
                  </div>
                </div>

                {isCurrentIssuer && isActive && (
                  <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="bg-red-600 hover:bg-red-700 text-white font-montserrat text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRevoking ? 'Revoking...' : 'Revoke Credential'}</span>
                  </button>
                )}
              </div>

              <div className="bg-[#F8F7F3] rounded-2xl p-6 border border-[#113221]/10 space-y-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-montserrat font-bold mb-1">
                    Credential ID Hash (bytes32)
                  </span>
                  <span className="break-all font-bold text-[#113221]">{queryCredentialIdBytes32}</span>
                </div>

                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-montserrat font-bold mb-1">
                    Issuer Wallet Address
                  </span>
                  <span className="break-all text-[#113221]">{issuerAddress}</span>
                </div>

                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-montserrat font-bold mb-1">
                    On-Chain Commitment Hash
                  </span>
                  <span className="break-all text-[#E85D34] font-bold">{commitmentHash}</span>
                </div>

                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-montserrat font-bold mb-1">
                    Issued Timestamp
                  </span>
                  <span className="text-[#113221] font-sans">
                    {new Date(issuedAtTimestamp * 1000).toLocaleString()} ({issuedAtTimestamp})
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
                <h4 className="font-montserrat font-bold text-sm text-[#113221] flex items-center space-x-2">
                  <Key className="w-4 h-4 text-[#E85D34]" />
                  <span>Verify Off-Chain Payload Integrity</span>
                </h4>
                <p className="text-xs font-inter text-gray-600">
                  Paste the raw off-chain JSON credential payload to verify that its Keccak-256 hash matches the on-chain commitment hash.
                </p>

                <textarea
                  rows={4}
                  value={offChainPayload}
                  onChange={(e) => setOffChainPayload(e.target.value)}
                  placeholder="Paste JSON payload here..."
                  className="w-full p-3 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D34]"
                />

                <button
                  onClick={handleVerifyOffChainPayload}
                  disabled={!offChainPayload.trim()}
                  className="bg-[#113221] text-white font-montserrat font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-[#1a442e] transition-colors disabled:opacity-50"
                >
                  Verify Hash Match
                </button>

                {payloadMatchStatus === 'MATCH' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-montserrat font-bold text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VERIFIED MATCH! The off-chain credential data has NOT been tampered with.</span>
                  </div>
                )}

                {payloadMatchStatus === 'MISMATCH' && (
                  <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 font-montserrat font-bold text-xs flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>TAMPER DETECTED! Computed hash does not match the on-chain commitment.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyCredentialCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="max-w-3xl mx-auto bg-white rounded-3xl p-12 shadow-xl border border-[#113221]/10 min-h-[300px] animate-pulse" />;
  }

  return <VerifyCredentialCardInner />;
}
