/**
 * Sistema de Roles Hierárquico - Frontend
 * Espelha a definição do backend para validação client-side
 * 
 * Níveis:
 * - TRAMITADOR (1): Visualiza e tramita setor
 * - EDITOR (2): Cadastra e Edita dados completos
 * - MODERADOR (3): Exclui (soft delete) e Atribui
 * - GESTOR (4): Prioriza e gerencia
 * - ADMIN (99): Gestão total
 */

export enum UserRole {
  TRAMITADOR = 'tramitador',
  EDITOR = 'editor',
  MODERADOR = 'moderador',
  GESTOR = 'gestor',
  ADMIN = 'admin'
}

export const RoleWeights: Record<UserRole, number> = {
  [UserRole.TRAMITADOR]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.MODERADOR]: 3,
  [UserRole.GESTOR]: 4,
  [UserRole.ADMIN]: 99
};

export const RoleLabels: Record<UserRole, string> = {
  [UserRole.TRAMITADOR]: 'Tramitador',
  [UserRole.EDITOR]: 'Editor',
  [UserRole.MODERADOR]: 'Moderador',
  [UserRole.GESTOR]: 'Gestor',
  [UserRole.ADMIN]: 'Administrador'
};

/**
 * Verifica se uma role tem permissão mínima
 */
export const hasMinRole = (userRole: UserRole | string, requiredRole: UserRole): boolean => {
  const userWeight = RoleWeights[userRole as UserRole] || 0;
  const requiredWeight = RoleWeights[requiredRole];
  return userWeight >= requiredWeight;
};

/**
 * Obtém o peso de uma role
 */
export const getRoleWeight = (role: UserRole | string): number => {
  return RoleWeights[role as UserRole] || 0;
};

/**
 * Obtém o label de uma role
 */
export const getRoleLabel = (role: UserRole | string): string => {
  return RoleLabels[role as UserRole] || role;
};

/**
 * Verifica se a role é válida
 */
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

// ============================================================
// Helpers de Permissão para uso nos componentes
// ============================================================

/** Pode visualizar processos e tramitar setor (TRAMITADOR+) */
export const canView = (role: UserRole | string): boolean => hasMinRole(role, UserRole.TRAMITADOR);

/** Pode criar e editar processos (EDITOR+) */
export const canCreate = (role: UserRole | string): boolean => hasMinRole(role, UserRole.EDITOR);

/** Pode editar processos completamente (EDITOR+) */
export const canEdit = (role: UserRole | string): boolean => hasMinRole(role, UserRole.EDITOR);

/** Pode excluir/arquivar processos (MODERADOR+) */
export const canDelete = (role: UserRole | string): boolean => hasMinRole(role, UserRole.MODERADOR);

/** Pode atribuir responsável (MODERADOR+) */
export const canAssign = (role: UserRole | string): boolean => hasMinRole(role, UserRole.MODERADOR);

/** Pode listar usuários (MODERADOR+) */
export const canListUsers = (role: UserRole | string): boolean => hasMinRole(role, UserRole.MODERADOR);

/** Pode definir prioridade (GESTOR+) */
export const canPrioritize = (role: UserRole | string): boolean => hasMinRole(role, UserRole.GESTOR);

/** Pode gerenciar usuários (ADMIN) */
export const canManageUsers = (role: UserRole | string): boolean => hasMinRole(role, UserRole.ADMIN);

/** Pode tramitar setor (TRAMITADOR+) */
export const canTramitar = (role: UserRole | string): boolean => hasMinRole(role, UserRole.TRAMITADOR);

// ============================================================
// Tipo para o Token decodificado
// ============================================================

export interface TokenPayload {
  id: number;
  email: string;
  role: UserRole;
  orgao_id: number;
  exp?: number;
  iat?: number;
}

// ============================================================
// Lista de roles para selects
// ============================================================

export const roleOptions = [
  { value: UserRole.TRAMITADOR, label: RoleLabels[UserRole.TRAMITADOR], weight: RoleWeights[UserRole.TRAMITADOR] },
  { value: UserRole.EDITOR, label: RoleLabels[UserRole.EDITOR], weight: RoleWeights[UserRole.EDITOR] },
  { value: UserRole.MODERADOR, label: RoleLabels[UserRole.MODERADOR], weight: RoleWeights[UserRole.MODERADOR] },
  { value: UserRole.GESTOR, label: RoleLabels[UserRole.GESTOR], weight: RoleWeights[UserRole.GESTOR] },
  { value: UserRole.ADMIN, label: RoleLabels[UserRole.ADMIN], weight: RoleWeights[UserRole.ADMIN] },
];
