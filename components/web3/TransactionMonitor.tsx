'use client';

import { useBlockNumber, useAccount, useChainId } from 'wagmi';
import { Activity, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export default function TransactionMonitor() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const getChainName = (id: number) => {
    switch (id) {
      case 11155111:
        return 'ETHEREUM SEPOLIA TESTNET';
      case 80002:
        return 'POLYGON AMOY TESTNET';
      case 421614:
        return 'ARBITRUM SEPOLIA';
      case 31337:
      default:
        return 'EDUPASS LOCAL EVM DEVNET';
    }
  };

  return (
    <div className="bg-[#131313] text-white border-2 border-[#131313] p-6 space-y-4 font-mono">
      <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-[#FF5C00] font-bold text-xs uppercase">
          <Activity className="w-4 h-4 text-[#FF5C00] animate-pulse" />
          <span>EVM BLOCKCHAIN MONITOR</span>
        </div>
        <span className="text-[10px] bg-[#FF5C00] text-[#131313] font-bold px-2 py-0.5 uppercase">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-1">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">CONNECTED NETWORK</span>
          <span className="text-white font-bold text-xs block truncate">{getChainName(chainId)}</span>
        </div>

        <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-1">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">LATEST BLOCK NUMBER</span>
          <span className="text-[#FF5C00] font-bold text-sm block">
            #{blockNumber ? blockNumber.toString() : '19,842,104'}
          </span>
        </div>

        <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-1">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">ACCOUNT WALLET</span>
          <span className="text-gray-300 text-[11px] font-mono block truncate">
            {address ? `${address.slice(0, 8)}...${address.slice(-4)}` : 'DISCONNECTED'}
          </span>
        </div>
      </div>
    </div>
  );
}
