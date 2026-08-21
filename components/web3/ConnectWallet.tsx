'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { LogOut, CheckCircle2, Loader2 } from 'lucide-react';

function ConnectWalletInner() {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;

      if (ethereum) {
        if (ethereum.providers?.length) {
          const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
          await metaMaskProvider.request({ method: 'eth_requestAccounts' });
        } else {
          await ethereum.request({ method: 'eth_requestAccounts' });
        }

        const targetConnector = connectors[0];
        if (targetConnector) {
          await connectAsync({ connector: targetConnector });
        }
      } else if (connectors[0]) {
        await connectAsync({ connector: connectors[0] });
      } else {
        alert('MetaMask extension not detected on window.ethereum. Please ensure MetaMask is enabled in your browser.');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err?.code === 4001 || err?.message?.includes('user rejected') || err?.message?.includes('User rejected')) {
        return;
      }
      alert(`Wallet connection failed: ${err?.message || 'Could not connect to wallet'}`);
    } finally {
      setConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#131313] text-white px-4 py-2 border border-[#131313] font-mono text-xs font-semibold tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5C00]" />
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button
            onClick={() => disconnect()}
            title="Disconnect Wallet"
            className="ml-2 text-gray-400 hover:text-[#FF5C00] transition-colors p-0.5"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const isLoading = isPending || connecting;

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="inline-flex items-center gap-2 bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-semibold text-xs tracking-wider uppercase px-5 py-2.5 border border-[#131313] transition-all duration-200 disabled:opacity-60 cursor-pointer"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>CONNECTING...</span>
        </>
      ) : (
        <span>CONNECT WALLET</span>
      )}
    </button>
  );
}

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-36 bg-[#131313]/10 animate-pulse border border-[#131313]" />
    );
  }

  return <ConnectWalletInner />;
}
