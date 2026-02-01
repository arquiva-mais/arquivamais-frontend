import { LogOut } from "lucide-react"
import { VscNewFolder } from "react-icons/vsc";
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/usePermissions"
import { NotificationBell } from "@/components/ui/NotificationBell"

interface DashboardHeaderProps {
  username: string
  onLogout: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, onLogout }) => {
  const { roleLabel, userRole } = usePermissions();

  // Cores pastel para cada role
  const roleColors: Record<string, string> = {
    'tramitador': 'bg-slate-100 text-slate-700',
    'editor': 'bg-blue-100 text-blue-700',
    'moderador': 'bg-purple-100 text-purple-700',
    'gestor': 'bg-amber-100 text-amber-700',
    'admin': 'bg-violet-100 text-violet-700',
  };

  // Gerar iniciais do nome do usuário
  const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* Container Centralizado - Mesma largura do conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo - Esquerda */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <VscNewFolder className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Arquiva+</h1>
        </div>

        {/* Área direita: Notificações + User Capsule */}
        <div className="flex items-center gap-3">
          {/* Sino de Notificações */}
          <NotificationBell />

          {/* User Capsule */}
          <div className="flex items-center bg-white border border-gray-200 rounded-full pl-2 pr-1 py-1 shadow-sm">
            {/* Avatar com iniciais */}
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {getInitials(username)}
              </span>
            </div>

            {/* Info: Nome + Badge */}
            <div className="flex items-center ml-2">
              <span className="text-sm font-medium text-gray-700">
                {username}
              </span>
              {userRole && (
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs font-medium border-0 ${roleColors[userRole] || 'bg-gray-100 text-gray-700'}`}
                >
                  {roleLabel}
                </Badge>
              )}
            </div>

            {/* Divisor vertical */}
            <div className="h-5 w-px bg-gray-200 mx-3" />

            {/* Botão Sair - Apenas ícone */}
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
              title="Sair do sistema"
              aria-label="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}