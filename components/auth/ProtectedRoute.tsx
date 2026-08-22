'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/auth/types';
import { getDashboardForRole } from '@/lib/auth/roles';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E5E4DF] flex items-center justify-center font-mono">
        <div className="bg-[#E2E1DC] border-2 border-[#131313] p-12 text-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#131313] border-t-[#FF5C00] rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-bold text-[#131313]">AUTHENTICATING SESSION...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role) && role !== 'ADMIN') {
    const userDashboard = getDashboardForRole(role);
    return (
      <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#E2E1DC] border-2 border-[#131313] p-8 md:p-12 space-y-6 text-center">
          <div className="w-12 h-12 bg-red-500 text-white font-bold text-xl flex items-center justify-center mx-auto border border-[#131313]">
            ✕
          </div>
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">[ ACCESS DENIED ]</span>
            <h1 className="text-2xl font-archivo font-bold uppercase mt-1">403 UNAUTHORIZED ROLE</h1>
          </div>
          <p className="text-xs uppercase leading-relaxed text-[#333333]">
            Your current account role (<strong>{role}</strong>) does not have authorization to view this endpoint.
          </p>
          <div className="pt-4">
            <Link
              href={userDashboard}
              className="inline-block bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase px-8 py-3.5 border border-[#131313] transition-colors"
            >
              GO TO MY DASHBOARD ↗
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
