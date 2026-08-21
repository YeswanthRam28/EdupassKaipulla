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
    <div className="w-full max-w-3xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-8 md:p-12 space-y-8 font-mono">
      <div>
        <div className="flex items-center gap-4 border-b border-[#131313] pb-6">
          <div className="w-12 h-12 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313] font-bold">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-[#FF5C00] uppercase block">
              [ PUBLIC VERIFIER SYSTEM ]
            </span>
            <h2 className="text-2xl md:text-3xl font-archivo font-bold uppercase text-[#131313]">
              Credential Verification Portal
            </h2>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Credential ID (e.g. EDU-2026-9283 or 0x...)"
            required
            className="flex-1 bg-[#EAE9E4] px-4 py-3.5 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00] uppercase"
          />
          <button
            type="submit"
            className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase tracking-widest px-8 py-3.5 border border-[#131313] transition-colors cursor-pointer"
          >
            QUERY ON-CHAIN
          </button>
        </form>
      </div>

      {queryCredentialIdBytes32 && (
        <div className="pt-6 border-t border-[#131313]">
          {isLoading && (
            <div className="text-center py-8 font-mono text-xs uppercase text-[#131313] animate-pulse">
              FETCHING CREDENTIAL RECORD FROM EVM SMART CONTRACT...
            </div>
          )}

          {!isLoading && !exists && (
            <div className="bg-[#EAE9E4] border border-[#131313] p-8 text-center space-y-3 font-mono">
              <ShieldAlert className="w-10 h-10 text-[#FF5C00] mx-auto" />
              <h3 className="font-archivo font-bold text-lg uppercase text-[#131313]">Credential Not Found</h3>
              <p className="text-xs text-[#333333] max-w-md mx-auto uppercase">
                No credential matching hash <code>{queryCredentialIdBytes32}</code> has been registered on this blockchain.
              </p>
            </div>
          )}

          {!isLoading && exists && (
            <div className="space-y-6">
              <div className={`p-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono ${
                isActive ? 'bg-[#131313] text-white border-[#131313]' : 'bg-red-100 border-red-500 text-red-900'
              }`}>
                <div className="flex items-center space-x-3">
                  {isActive ? (
                    <CheckCircle2 className="w-8 h-8 text-[#FF5C00] shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-archivo font-bold text-lg uppercase">
                      {isActive ? 'AUTHENTIC & ACTIVE CREDENTIAL' : 'REVOKED CREDENTIAL'}
                    </h3>
                    <p className="text-xs uppercase opacity-80">
                      {isActive ? 'This credential commitment is verified active on the EVM registry.' : 'This credential has been revoked by the issuing institution.'}
                    </p>
                  </div>
                </div>

                {isCurrentIssuer && isActive && (
                  <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase px-4 py-2 border border-[#131313] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                    <span>{isRevoking ? 'REVOKING...' : 'REVOKE CREDENTIAL'}</span>
                  </button>
                )}
              </div>

              <div className="bg-[#EAE9E4] border border-[#131313] p-6 space-y-4 text-xs font-mono">
                <div>
                  <span className="text-[#6B7280] block uppercase font-bold text-[10px] mb-1">
                    CREDENTIAL ID HASH (BYTES32)
                  </span>
                  <span className="break-all font-bold text-[#131313]">{queryCredentialIdBytes32}</span>
                </div>

                <div>
                  <span className="text-[#6B7280] block uppercase font-bold text-[10px] mb-1">
                    ISSUER WALLET ADDRESS
                  </span>
                  <span className="break-all text-[#131313]">{issuerAddress}</span>
                </div>

                <div>
                  <span className="text-[#6B7280] block uppercase font-bold text-[10px] mb-1">
                    ON-CHAIN COMMITMENT HASH
                  </span>
                  <span className="break-all text-[#FF5C00] font-bold">{commitmentHash}</span>
                </div>

                <div>
                  <span className="text-[#6B7280] block uppercase font-bold text-[10px] mb-1">
                    ISSUED TIMESTAMP
                  </span>
                  <span className="text-[#131313]">
                    {new Date(issuedAtTimestamp * 1000).toLocaleString()} ({issuedAtTimestamp})
                  </span>
                </div>
              </div>

              <div className="bg-[#EAE9E4] border border-[#131313] p-6 space-y-4 font-mono">
                <h4 className="font-archivo font-bold text-sm uppercase text-[#131313] flex items-center space-x-2">
                  <Key className="w-4 h-4 text-[#FF5C00]" />
                  <span>VERIFY OFF-CHAIN PAYLOAD INTEGRITY</span>
                </h4>
                <p className="text-xs uppercase text-[#333333]">
                  Paste raw off-chain JSON credential payload to verify Keccak-256 hash match against on-chain commitment.
                </p>

                <textarea
                  rows={4}
                  value={offChainPayload}
                  onChange={(e) => setOffChainPayload(e.target.value)}
                  placeholder="Paste JSON payload here..."
                  className="w-full bg-white p-3 border border-[#131313] font-mono text-xs focus:outline-none focus:border-[#FF5C00]"
                />

                <button
                  onClick={handleVerifyOffChainPayload}
                  disabled={!offChainPayload.trim()}
                  className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-6 py-2.5 border border-[#131313] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  VERIFY HASH MATCH
                </button>

                {payloadMatchStatus === 'MATCH' && (
                  <div className="p-4 bg-[#131313] text-white border border-[#131313] font-mono font-bold text-xs uppercase flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5C00]" />
                    <span>VERIFIED MATCH! OFF-CHAIN PAYLOAD HAS NOT BEEN TAMPERED WITH.</span>
                  </div>
                )}

                {payloadMatchStatus === 'MISMATCH' && (
                  <div className="p-4 bg-red-100 border border-red-500 text-red-900 font-mono font-bold text-xs uppercase flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>TAMPER DETECTED! COMPUTED HASH DOES NOT MATCH ON-CHAIN COMMITMENT.</span>
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
    return <div className="w-full max-w-3xl mx-auto bg-[#E2E2E2] border-2 border-[#131313] p-12 min-h-[300px] animate-pulse" />;
  }

  return <VerifyCredentialCardInner />;
}
