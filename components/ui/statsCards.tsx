import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface StatsCardsProps {
  totalProcessos: number
  processosConcluidos: number
  processosEmAndamento: number
  processosCancelados: number
  totalValorConvenio: number
  totalValorRecursoProprio: number
  totalValorRoyalties: number
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalProcessos,
  processosConcluidos,
  processosEmAndamento,
  processosCancelados,
  totalValorConvenio,
  totalValorRecursoProprio,
  totalValorRoyalties
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const pieData = [
    {
      name: 'Convênio',
      value: totalValorConvenio,
      color: '#3b82f6'
    },
    {
      name: 'Recurso Próprio',
      value: totalValorRecursoProprio,
      color: '#10b981'
    },
    {
      name: 'Royalties',
      value: totalValorRoyalties,
      color: '#8b5cf6'
    }
  ]

  const totalGeral = totalValorConvenio + totalValorRecursoProprio + totalValorRoyalties

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="h-32">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between h-full">
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

        <Card className="h-32">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between h-full">
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

        <Card className="h-32">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-medium text-slate-600">Cancelados</p>
                <p className="text-3xl font-bold text-slate-900">{processosCancelados}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="h-32">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between h-full">
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

        <Card className="h-32 md:col-span-1 lg:col-span-2">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Valores Financeiros</h3>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Total Geral</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalGeral)}</p>
                </div>
              </div>

              <div className="flex-1 px-4">
                {totalGeral > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Convênio</span>
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {formatCurrency(totalValorConvenio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Recurso Próprio</span>
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {formatCurrency(totalValorRecursoProprio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Royalties</span>
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {formatCurrency(totalValorRoyalties)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sem dados financeiros</p>
                )}
              </div>

              <div className="w-20 h-20 flex items-center justify-center">
                {totalGeral > 0 ? (
                  <ResponsiveContainer width={80} height={80}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={38}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <p className="text-gray-400 text-xs">Sem dados</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
