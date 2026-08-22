'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';

const OnboardingClientForm = dynamic(
  () => import('@/components/auth/OnboardingClientForm'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-2xl bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center font-mono">
        <p className="text-xs uppercase font-bold text-[#131313] animate-pulse">
          INITIALIZING ONBOARDING PORTAL...
        </p>
      </div>
    ),
  }
);

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <OnboardingClientForm />
      </main>
    </div>
  );
}
