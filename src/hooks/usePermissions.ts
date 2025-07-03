// ===== 10. usePermissions.ts - Permission Hook =====
// src/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type Permission = 
  | 'read_documents' 
  | 'write_documents' 
  | 'delete_documents' 
  | 'admin_access'
  | 'user_management'
  | 'system_settings';

export type Role = 'admin' | 'user' | 'viewer' | 'guest';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'read_documents',
    'write_documents', 
    'delete_documents',
    'admin_access',
    'user_management',
    'system_settings'
  ],
  user: [
    'read_documents',
    'write_documents'
  ],
  viewer: [
    'read_documents'
  ],
  guest: []
};

export function usePermissions() {
  const { user } = useAuth();

  const userRole = useMemo(() => {
    return (user?.role as Role) || 'guest';
  }, [user]);

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[userRole] || [];
  }, [userRole]);

  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      return permissions.includes(permission);
    };
  }, [permissions]);

  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some(permission => permissions.includes(permission));
    };
  }, [permissions]);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every(permission => permissions.includes(permission));
    };
  }, [permissions]);

  const canAccess = useMemo(() => {
    return (resource: string, action: string): boolean => {
      // Define resource-action to permission mapping
      const resourcePermissions: Record<string, Record<string, Permission>> = {
        documents: {
          read: 'read_documents',
          write: 'write_documents',
          delete: 'delete_documents'
        },
        admin: {
          access: 'admin_access'
        },
        users: {
          manage: 'user_management'
        }
      };

      const requiredPermission = resourcePermissions[resource]?.[action];
      return requiredPermission ? hasPermission(requiredPermission) : false;
    };
  }, [hasPermission]);

  return {
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    isViewer: userRole === 'viewer',
    isGuest: userRole === 'guest'
  };
}

