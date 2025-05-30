import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Processo {
  numero_processo: string
  data_entrada: string
  competencia: string
  objeto: string
  interessado: string
  orgao_gerador: string
  responsavel: string
  setor_atual: string
  descricao: string
  observacao: string
  valor_convenio: number
  valor_recurso_proprio: number
  valor_royalties: number
  concluido: boolean
}

interface ProcessosTableProps {
  processos: Processo[]
  userRole: string
}

export const ProcessTable: React.FC<ProcessosTableProps> = ({ processos, userRole }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredProcessos = processos.filter(
    (processo) =>
      processo.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.interessado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredProcessos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProcessos = filteredProcessos.slice(startIndex, endIndex)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalValue = (processo: Processo) => {
    return processo.valor_convenio + processo.valor_recurso_proprio + processo.valor_royalties
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">Processos</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar processos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            {userRole === "admin" && (
              <Link href="/dashboard/novo-processo">
                <Button className="w-full sm:w-auto cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Processo
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Objeto</TableHead>
                <TableHead>Interessado</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Setor Atual</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProcessos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {searchTerm ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                currentProcessos.map((processo, index) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{processo.numero_processo}</TableCell>
                    <TableCell className="max-w-xs truncate" title={processo.objeto}>
                      {processo.objeto}
                    </TableCell>
                    <TableCell>{processo.interessado}</TableCell>
                    <TableCell>{processo.responsavel}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{processo.setor_atual}</Badge>
                    </TableCell>
                    <TableCell>{new Date(processo.data_entrada).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(getTotalValue(processo))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={processo.concluido ? "default" : "secondary"}
                        className={processo.concluido ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}
                      >
                        {processo.concluido ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-600">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProcessos.length)} de {filteredProcessos.length} processos
            </p>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0 cursor-pointer"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="cursor-pointer"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}