import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { VscNewFolder } from "react-icons/vsc";

interface DashboardHeaderProps {
   username: string
  onLogout: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, onLogout }) => {
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