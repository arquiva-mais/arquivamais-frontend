import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
  isLoading: boolean
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  searchTerm: string
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
}

export const ProcessTable: React.FC<ProcessosTableProps> = ({
  processos,
  userRole,
  isLoading,
  pagination,
  searchTerm,
  onPageChange,
  onSearch,
  onNextPage,
  onPreviousPage
}) => {
  const [inputValue, setInputValue] = useState(searchTerm)
  const [isLoadingPage, setIsLoadingPage] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchTerm) {
        onSearch(inputValue)
      }
    }, 500)
    console.log(isLoadingPage)
    return () => clearTimeout(timer)
  }, [inputValue, searchTerm, onSearch])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleLoadingPage = () => {
    setIsLoadingPage(true)
    router.push('/dashboard/novo-processo')
  }

  const getTotalValue = (processo: Processo) => {
    return processo.valor_convenio + processo.valor_recurso_proprio + processo.valor_royalties
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">
            Processos
            {isLoading && (
              <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />
            )}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar processos..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 w-full sm:w-64"
                disabled={isLoading}
              />
            </div>
            {userRole === "admin" && (
              <Button onClick={handleLoadingPage} className="w-full sm:w-auto cursor-pointer" disabled={isLoadingPage}>
                {isLoadingPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Processo
                  </>
                )}
              </Button>
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
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : processos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {searchTerm ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                processos.map((processo, index) => (
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

        {/* Paginação da API */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-600">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de {pagination.totalItems} processos
            </p>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousPage}
                disabled={pagination.currentPage === 1}
                className="cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNumber
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1
                  } else {
                    const start = Math.max(1, pagination.currentPage - 2)
                    pageNumber = start + i
                  }

                  if (pageNumber > pagination.totalPages) return null

                  return (
                    <Button
                      key={pageNumber}
                      variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNumber)}
                      className="w-8 h-8 p-0 cursor-pointer"
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={pagination.currentPage === pagination.totalPages}
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