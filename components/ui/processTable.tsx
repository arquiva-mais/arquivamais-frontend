import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, ChevronLeft, ChevronRight, Loader2, Filter, Calendar, X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

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

interface FilterOptions {
  objetos: string[];
  status: string[];
  setores: string[];
  interessados: string[];
  responsaveis: string[];
}

interface SelectedFilters {
  objeto: string | null;
  status: string | null;
  setor: string | null;
  interessado: string | null;
  responsavel: string | null;
  data_inicio: string | null;
  data_fim: string | null;
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

  filterOptions: FilterOptions;
  selectedFilters: SelectedFilters;
  onFilterChange: (filterType: keyof SelectedFilters, value: string | null) => void;
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
  onPreviousPage,
  filterOptions,
  selectedFilters,
  onFilterChange,
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

  const hasActiveFilters = Object.values(selectedFilters).some(value => value !== null);

  const activeFiltersCount = Object.values(selectedFilters).filter(value => value !== null).length;

  const clearAllFilters = () => {
    /*
    const clearedFilters: SelectedFilters = {
      objeto: null,
      status: null,
      setor: null,
      interessado: null,
      responsavel: null,
      data_inicio: null,
      data_fim: null,
    };
    */

    Object.keys(selectedFilters).forEach(key => {
      const filterKey = key as keyof SelectedFilters;
      if (selectedFilters[filterKey] !== null) {
        onFilterChange(filterKey, null);
      }
    });
  };

  const renderFilterSubMenu = (
    filterType: keyof SelectedFilters,
    label: string,
    options: string[]
  ) => {
    const selectedValue = selectedFilters[filterType];
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <div className="flex items-center justify-between w-full">
            <span>{label}</span>
            {selectedValue && (
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {selectedValue}
                </Badge>
              </div>
            )}
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem
            checked={!selectedValue}
            onCheckedChange={() => onFilterChange(filterType, null)}
          >
            Todos
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selectedValue === option}
              onCheckedChange={() => onFilterChange(filterType, option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };

  const formatDateLocal = (dateString: string) => {
    if (!dateString) return '...';

    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString('pt-BR');
  };

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

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading} className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {renderFilterSubMenu("objeto", "Objeto", filterOptions.objetos)}

                {renderFilterSubMenu("status", "Status", filterOptions.status)}

                {renderFilterSubMenu("setor", "Setor", filterOptions.setores)}

                <DropdownMenuSeparator />

                <div className="px-2 py-2">
                  <div className="text-sm font-medium mb-2">Período de Entrada</div>

                  <div className="mb-2">
                    <div className="text-xs text-slate-600 mb-1">Data início:</div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                        <Input
                          type="date"
                          placeholder="Data início"
                          value={selectedFilters.data_inicio || ''}
                          onChange={(e) => onFilterChange('data_inicio', e.target.value || null)}
                          className="pl-7 h-8 text-xs"
                          disabled={isLoading}
                        />
                      </div>
                      {selectedFilters.data_inicio && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFilterChange('data_inicio', null)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="text-xs text-slate-600 mb-1">Data fim:</div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                        <Input
                          type="date"
                          placeholder="Data fim"
                          value={selectedFilters.data_fim || ''}
                          onChange={(e) => onFilterChange('data_fim', e.target.value || null)}
                          className="pl-7 h-8 text-xs"
                          disabled={isLoading}
                          min={selectedFilters.data_inicio || undefined}
                        />
                      </div>
                      {selectedFilters.data_fim && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFilterChange('data_fim', null)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {(selectedFilters.data_inicio || selectedFilters.data_fim) && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                      <strong>Período:</strong>{' '}
                      {formatDateLocal(selectedFilters.data_inicio || '')} até {' '}
                      {formatDateLocal(selectedFilters.data_fim || '')}
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="w-full justify-start text-slate-600 hover:text-slate-800"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar todos os filtros
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-sm text-slate-600">Filtros ativos:</div>
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value) return null;

              const labels = {
                objeto: 'Objeto',
                status: 'Status',
                setor: 'Setor',
                interessado: 'Interessado',
                responsavel: 'Responsável',
                data_inicio: 'Data início',
                data_fim: 'Data fim'
              };

              return (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {labels[key as keyof typeof labels]}: {
                    (key === 'data_inicio' || key === 'data_fim')
                      ? formatDateLocal(value)
                      : value
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange(key as keyof SelectedFilters, null)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}
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
                    {searchTerm || hasActiveFilters ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
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
                    <TableCell>
                      {formatDateLocal(processo.data_entrada.split('T')[0])}
                    </TableCell>
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