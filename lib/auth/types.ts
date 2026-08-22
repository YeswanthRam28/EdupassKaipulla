export type UserRole = 'STUDENT' | 'INSTITUTION' | 'VERIFIER' | 'EMPLOYER' | 'ADMIN';

export type PublicUserRole = 'STUDENT' | 'INSTITUTION' | 'VERIFIER' | 'EMPLOYER';

export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  student_id?: string;
  institution_id?: string;
  institution_name?: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  role: PublicUserRole;
  wallet_address?: string;
  student_id?: string;
  institution_id?: string;
  institution_name?: string;
}
