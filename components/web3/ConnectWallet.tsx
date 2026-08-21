'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut, CheckCircle2, Loader2 } from 'lucide-react';

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
        // Handle multiple injected wallet extensions
        if (ethereum.providers?.length) {
          const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
          await metaMaskProvider.request({ method: 'eth_requestAccounts' });
        } else {
          await ethereum.request({ method: 'eth_requestAccounts' });
        }

        // Connect Wagmi state
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
        <div className="flex items-center gap-2 bg-[#113221] text-white px-4 py-2 rounded-full font-montserrat text-xs font-semibold shadow-sm border border-[#113221]/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button
            onClick={() => disconnect()}
            title="Disconnect Wallet"
            className="ml-1 text-gray-300 hover:text-red-400 transition-colors p-0.5"
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
      className="inline-flex items-center gap-2 bg-[#E85D34] hover:bg-[#d44c25] text-white font-montserrat font-semibold text-xs px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </>
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
      <div className="h-10 w-36 bg-gray-200/50 animate-pulse rounded-full" />
    );
  }

  return <ConnectWalletInner />;
}
