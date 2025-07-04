export interface User {
  user_id: string;
  user_name: string;
  email: string;
  access_token: string;
  role: 'parent' | 'child';
  parent_id?: string;
  children?: string[];
  is_active: boolean;
  exchanges: string[];
  products: string[];
  order_types: string[];
}

export interface AuthContextType {
  user: User | null;
  login: (role: 'parent' | 'child') => Promise<void>;
  logout: () => void;
  loading: boolean;
  handleAuthCallback: (code: string, state: string) => Promise<User>;
}