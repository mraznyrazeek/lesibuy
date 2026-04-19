export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  role: string;
  token: string;
}