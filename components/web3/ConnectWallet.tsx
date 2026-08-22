'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { getDashboardForRole } from '@/lib/auth/roles';
import { LogOut, CheckCircle2, Loader2, Wallet } from 'lucide-react';

function ConnectWalletInner() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { walletLogin, user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [connecting, setConnecting] = useState(false);
  const attemptedWalletRef = useRef<string | null>(null);

  // Auto-login & onboarding check ONCE per wallet connection
  useEffect(() => {
    if (!isConnected || !address) {
      attemptedWalletRef.current = null;
      return;
    }

    const currentWallet = address.toLowerCase();

    // Already authenticated for this exact wallet address
    if (isAuthenticated && user?.wallet_address?.toLowerCase() === currentWallet) {
      attemptedWalletRef.current = currentWallet;
      return;
    }

    // Prevent duplicate re-fetching if we already attempted this wallet
    if (attemptedWalletRef.current === currentWallet) {
      return;
    }

    attemptedWalletRef.current = currentWallet;

    walletLogin(address).then((res) => {
      if (res.is_new_user) {
        router.push(`/onboarding?wallet=${encodeURIComponent(address)}`);
      } else if (res.user) {
        const targetDashboard = getDashboardForRole(res.user.role);
        router.push(targetDashboard);
      }
    }).catch((err) => {
      console.error('Wallet login error:', err);
    });
  }, [isConnected, address, isAuthenticated, user?.wallet_address]);

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
          const res = await connectAsync({ connector: targetConnector });
          if (res.accounts && res.accounts[0]) {
            const loginRes = await walletLogin(res.accounts[0]);
            if (loginRes.is_new_user) {
              router.push(`/onboarding?wallet=${encodeURIComponent(res.accounts[0])}`);
            } else if (loginRes.user) {
              const targetDashboard = getDashboardForRole(loginRes.user.role);
              router.push(targetDashboard);
            }
          }
        }
      } else if (connectors[0]) {
        const res = await connectAsync({ connector: connectors[0] });
        if (res.accounts && res.accounts[0]) {
          const loginRes = await walletLogin(res.accounts[0]);
          if (loginRes.is_new_user) {
            router.push(`/onboarding?wallet=${encodeURIComponent(res.accounts[0])}`);
          } else if (loginRes.user) {
            const targetDashboard = getDashboardForRole(loginRes.user.role);
            router.push(targetDashboard);
          }
        }
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

  const handleDisconnect = async () => {
    attemptedWalletRef.current = null;
    await logout();
    disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#131313] text-white px-4 py-2 border border-[#131313] font-mono text-xs font-semibold tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5C00]" />
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          {user?.role && (
            <span className="bg-[#FF5C00] text-[#131313] text-[9px] font-bold px-1.5 py-0.5 uppercase">
              {user.role}
            </span>
          )}
          <button
            onClick={handleDisconnect}
            title="Disconnect Wallet & Sign Out"
            className="ml-2 text-gray-400 hover:text-[#FF5C00] transition-colors p-0.5 cursor-pointer"
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
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5C00]" />
          <span>CONNECTING...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 text-[#FF5C00]" />
          <span>CONNECT WALLET / LOGIN</span>
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
      <div className="h-10 w-44 bg-[#131313]/10 animate-pulse border border-[#131313]" />
    );
  }

  return <ConnectWalletInner />;
}
