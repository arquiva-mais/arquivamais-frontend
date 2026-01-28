import { Button } from "@/components/ui/button"
import { User, LogOut, Shield } from "lucide-react"
import { VscNewFolder } from "react-icons/vsc";
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/usePermissions"

interface DashboardHeaderProps {
   username: string
  onLogout: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, onLogout }) => {
  const { roleLabel, userRole } = usePermissions();

  // Cores para cada role
  const roleColors: Record<string, string> = {
    'tramitador': 'bg-slate-100 text-slate-700 border-slate-300',
    'editor': 'bg-blue-100 text-blue-700 border-blue-300',
    'moderador': 'bg-purple-100 text-purple-700 border-purple-300',
    'gestor': 'bg-amber-100 text-amber-700 border-amber-300',
    'admin': 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <VscNewFolder className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Arquiva+</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>{`Olá, ${username}!`}</span>
              {userRole && (
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs font-medium ${roleColors[userRole] || 'bg-gray-100'}`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {roleLabel}
                </Badge>
              )}
            </div>
            <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="cursor-pointer bg-red-500 text-white hover:bg-red-700 rounded-lg transition-all duration-300 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}