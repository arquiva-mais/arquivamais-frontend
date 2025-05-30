import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle, Clock } from "lucide-react"

interface StatsCardsProps {
  totalProcessos: number
  processosConcluidos: number
  processosEmAndamento: number
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalProcessos,
  processosConcluidos,
  processosEmAndamento
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total de Processos</p>
              <p className="text-3xl font-bold text-slate-900">{totalProcessos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Processos Concluídos</p>
              <p className="text-3xl font-bold text-slate-900">{processosConcluidos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Em Andamento</p>
              <p className="text-3xl font-bold text-slate-900">{processosEmAndamento}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}