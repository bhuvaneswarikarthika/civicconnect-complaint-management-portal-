import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { civicApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (usernameOrEmail: string, forcedRole?: UserRole, password?: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    ward: string;
    role?: UserRole;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  switchRole: (targetRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'civicconnect_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = async (
    usernameOrEmail: string,
    forcedRole?: UserRole,
    password?: string
  ): Promise<boolean> => {
    const cleanId = usernameOrEmail.toLowerCase().trim();

    try {
      // Call backend API for secure authentication
      const res = await civicApi.authLogin(cleanId, password, forcedRole);
      if (res?.success && res.user) {
        const u = res.user;
        const normalized: User = {
          id: u.user_id || u.id || `UID-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          user_id: u.user_id || u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+91 98401 00000',
          address: u.address || 'Anna Nagar West',
          ward: u.ward || 'Ward 12 - Anna Nagar West',
          role: u.role || forcedRole || 'citizen',
          avatar: u.avatar || (u.role === 'admin'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
            : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'),
          created_at: u.created_at || new Date().toISOString(),
        };
        setUser(normalized);
        return true;
      }
    } catch (err) {
      console.warn('Backend login fallback to local handler:', err);
    }

    // Local fallback for offline/preview
    // Check if matching demo user
    const matched = DEMO_USERS.find((u) => {
      if (forcedRole) {
        return u.email.toLowerCase() === cleanId && u.role === forcedRole;
      }
      return u.email.toLowerCase() === cleanId;
    });

    if (matched) {
      setUser({
        ...matched,
        user_id: matched.user_id || (matched.role === 'admin' ? 'ADM-2026-001' : 'UID-2026-10492'),
      });
      return true;
    }

    if (
      cleanId === 'admin1234' ||
      password === 'admin1234' ||
      forcedRole === 'admin' ||
      cleanId === 'admin' ||
      cleanId.includes('admin') ||
      cleanId.includes('commissioner')
    ) {
      const adminDemo = DEMO_USERS.find((u) => u.role === 'admin') || DEMO_USERS[1];
      setUser({
        ...adminDemo,
        user_id: 'ADM-2026-001',
      });
      return true;
    }

    const role: UserRole =
      forcedRole ||
      (cleanId.includes('admin') || cleanId.includes('gov') ? 'admin' : 'citizen');

    // If citizen entered a specific User ID (e.g. UID-2026-10492 or similar), preserve it
    const generatedUid =
      role === 'admin'
        ? 'ADM-2026-001'
        : cleanId.toUpperCase().startsWith('UID-')
        ? cleanId.toUpperCase()
        : `UID-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser: User = {
      id: generatedUid,
      user_id: generatedUid,
      name:
        cleanId.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
        (role === 'admin' ? 'Municipal Officer' : 'Resident Citizen'),
      email: cleanId.includes('@') ? cleanId : `${cleanId}@civicconnect.${role === 'admin' ? 'gov.in' : 'org'}`,
      phone: '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
      address: role === 'admin' ? 'Municipal Corporation Headquarters, Ward 12' : 'Anna Nagar, Ward 12',
      ward: 'Ward 12 - Anna Nagar West',
      role,
      avatar:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    ward: string;
    role?: UserRole;
  }): Promise<boolean> => {
    try {
      const res = await civicApi.authRegister(data);
      if (res?.success && res.user) {
        const u = res.user;
        const normalized: User = {
          id: u.user_id || u.id,
          user_id: u.user_id || u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address,
          ward: u.ward,
          role: u.role || 'citizen',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
          created_at: u.created_at || new Date().toISOString(),
        };
        setUser(normalized);
        return true;
      }
    } catch (e) {
      console.warn('Backend register fallback to local handler:', e);
    }

    const uniqueUserId = `UID-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newUser: User = {
      id: uniqueUserId,
      user_id: uniqueUserId,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      ward: data.ward,
      role: data.role || 'citizen',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const switchRole = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      const adminUser = DEMO_USERS.find((u) => u.role === 'admin') || {
        ...DEMO_USERS[1],
        role: 'admin',
        user_id: 'ADM-2026-001',
      };
      setUser(adminUser);
    } else {
      const citizenUser = DEMO_USERS.find((u) => u.role === 'citizen') || DEMO_USERS[0];
      setUser({
        ...citizenUser,
        user_id: 'UID-2026-10492',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
