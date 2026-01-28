'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserRole, 
  hasMinRole, 
  canCreate, 
  canEdit, 
  canDelete, 
  canAssign, 
  canTramitar, 
  canPrioritize, 
  canManageUsers,
  canListUsers,
  getRoleLabel,
  getRoleWeight
} from '@/types/auth';

interface UsePermissionsReturn {
  // Role atual do usuário
  userRole: UserRole | null;
  roleLabel: string;
  roleWeight: number;
  
  // Verificações de permissão
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canTramitar: boolean;
  canPrioritize: boolean;
  canManageUsers: boolean;
  canListUsers: boolean;
  
  // Função genérica para verificar qualquer role mínima
  hasMinRole: (requiredRole: UserRole) => boolean;
  
  // Loading state
  isLoading: boolean;
}

/**
 * Hook para gerenciar permissões baseadas em roles hierárquicas
 * 
 * @example
 * const { canCreate, canDelete, userRole } = usePermissions();
 * 
 * {canCreate && <Button>Novo Processo</Button>}
 * {canDelete && <Button variant="destructive">Excluir</Button>}
 */
export function usePermissions(): UsePermissionsReturn {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar role do localStorage
  useEffect(() => {
    const loadRole = () => {
      try {
        const storedRole = localStorage.getItem('role');
        
        if (storedRole && Object.values(UserRole).includes(storedRole as UserRole)) {
          setUserRole(storedRole as UserRole);
        } else {
          // Tentar decodificar do token
          const token = localStorage.getItem('authToken');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.role && Object.values(UserRole).includes(payload.role)) {
                setUserRole(payload.role as UserRole);
                localStorage.setItem('role', payload.role);
              }
            } catch {
              console.warn('[usePermissions] Erro ao decodificar token');
            }
          }
        }
      } catch (error) {
        console.error('[usePermissions] Erro ao carregar role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();

    // Listener para mudanças no localStorage (útil para multi-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'role' || e.key === 'authToken') {
        loadRole();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoizar as permissões baseadas na role
  const permissions = useMemo(() => {
    if (!userRole) {
      return {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canTramitar: false,
        canPrioritize: false,
        canManageUsers: false,
        canListUsers: false,
      };
    }

    return {
      canView: hasMinRole(userRole, UserRole.TRAMITADOR),
      canCreate: canCreate(userRole),
      canEdit: canEdit(userRole),
      canDelete: canDelete(userRole),
      canAssign: canAssign(userRole),
      canTramitar: canTramitar(userRole),
      canPrioritize: canPrioritize(userRole),
      canManageUsers: canManageUsers(userRole),
      canListUsers: canListUsers(userRole),
    };
  }, [userRole]);

  // Função para verificar role mínima
  const checkMinRole = useCallback((requiredRole: UserRole): boolean => {
    if (!userRole) return false;
    return hasMinRole(userRole, requiredRole);
  }, [userRole]);

  return {
    userRole,
    roleLabel: userRole ? getRoleLabel(userRole) : '',
    roleWeight: userRole ? getRoleWeight(userRole) : 0,
    ...permissions,
    hasMinRole: checkMinRole,
    isLoading,
  };
}
