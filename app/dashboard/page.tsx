'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { getDashboardForRole } from '@/lib/auth/roles';

export default function DashboardRedirectPage() {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && role) {
        const targetDashboard = getDashboardForRole(role);
        router.push(targetDashboard);
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, role, router]);

  return (
    <div className="min-h-screen bg-[#E5E4DF] flex items-center justify-center font-mono text-xs uppercase text-[#131313]">
      <div className="bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#131313] border-t-[#FF5C00] rounded-full animate-spin mx-auto" />
        <p className="font-bold">ROUTING TO YOUR ROLE DASHBOARD...</p>
      </div>
    </div>
  );
}
