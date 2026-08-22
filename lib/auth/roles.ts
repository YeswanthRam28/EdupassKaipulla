import { UserRole, PublicUserRole } from './types';

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  STUDENT: '/student/dashboard',
  INSTITUTION: '/institution/dashboard',
  VERIFIER: '/verifier/dashboard',
  EMPLOYER: '/employer/dashboard',
  ADMIN: '/admin/dashboard',
};

export interface RoleMetadata {
  role: PublicUserRole;
  label: string;
  description: string;
}

export const PUBLIC_ROLES: RoleMetadata[] = [
  {
    role: 'STUDENT',
    label: 'Student',
    description: 'Own and manage your academic credentials and passport.',
  },
  {
    role: 'INSTITUTION',
    label: 'Institution',
    description: 'Issue and manage verifiable academic credentials.',
  },
  {
    role: 'VERIFIER',
    label: 'Verifier',
    description: 'Verify academic records and zero-knowledge proofs.',
  },
  {
    role: 'EMPLOYER',
    label: 'Employer',
    description: 'Verify academic proofs and issue professional credentials.',
  },
];

export function getDashboardForRole(role: UserRole): string {
  return ROLE_DASHBOARDS[role] || '/dashboard';
}
