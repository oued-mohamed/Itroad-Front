// ===== 3. src/types/user.ts =====
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'admin' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  address?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

