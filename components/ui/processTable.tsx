import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Calendar,
  X,
  Edit,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ProcessDetails } from "./processDetails";
import { SearchableSelect } from "@/components/ui/searchable-select";
import api, { setoresApi } from "@/services/api";
import { useToast } from "@/components/providers/toastProvider";
import { AlertTriangle } from "lucide-react";

interface Processo {
  id?: number;
  numero_processo: string;
  data_entrada: string;
  competencia: string;
  objeto: string;
  credor: string;
  interessado?: string; // Mantém para compatibilidade com dados antigos
  orgao_gerador: string;
  responsavel: string;
  setor_atual: string;
  link_processo?: string;
  descricao: string;
  observacao: string;
  valor_convenio: number;
  valor_recurso_proprio: number;
  valor_royalties: number;
  status: "em_andamento" | "concluido";
  update_for?: string;
  createdAt?: string;
  data_atualizacao?: string;
  dias_no_setor?: number;
}

interface FilterOptions {
  objetos: string[];
  status: string[];
  setores: string[];
  credores: string[];
  responsaveis: string[];
}

interface SelectedFilters {
  objeto: string | null;
  status: string | null;
  setor: string | null;
  credor: string | null;
  responsavel: string | null;
  data_inicio: string | null;
  data_fim: string | null;
}

interface ProcessosTableProps {
  processos: Processo[];
  userRole: string;
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;

  filterOptions: FilterOptions;
  selectedFilters: SelectedFilters;
  onFilterChange: (
    filterType: keyof SelectedFilters,
    value: string | null,
  ) => void;
  sortConfig?: { field: string; direction: "asc" | "desc" };
  onSort?: (field: string) => void;
  showCompleted?: boolean;
  onToggleShowCompleted?: (checked: boolean) => void;
}
// ✅ COMPONENTE PARA CABEÇALHO ORDENÁVEL
const SortableHeader = ({
  children,
  field,
  sortConfig,
  onSort,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  field: string;
  sortConfig?: { field: string; direction: "asc" | "desc" };
  onSort?: (field: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
}) => {
  const isActive = sortConfig?.field === field;
  const direction = sortConfig?.direction;

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  return (
    <TableHead
      className={`cursor-pointer hover:bg-slate-100 transition-colors select-none ${className}`}
      onClick={() => onSort?.(field)}
    >
      <div className={`flex items-center gap-2 ${justifyClass}`}>
        {align === "right" && (
          <div className="flex items-center">
            {isActive ? (
              direction === "asc" ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )
            ) : (
              <ChevronsUpDown className="w-4 h-4 opacity-50 ml-1" />
            )}
          </div>
        )}
        {children}
        {align !== "right" && (
          <>
            {isActive ? (
              direction === "asc" ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )
            ) : (
              <ChevronsUpDown className="w-4 h-4 opacity-50" />
            )}
          </>
        )}
      </div>
    </TableHead>
  );
};
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
  sortConfig,
  onSort,
  showCompleted,
  onToggleShowCompleted,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);

  const router = useRouter();
  const { showNotification } = useToast();

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const data = await setoresApi.listar();
        if (Array.isArray(data)) {
          setAvailableSectors(data.map((s: any) => s.nome));
        }
      } catch (error) {
        console.error("Erro ao carregar setores:", error);
      }
    };
    loadSectors();
  }, []);

  // Estados para edição de setor
  const [sectorToUpdate, setSectorToUpdate] = useState<{
    processId: number;
    newSector: string;
    currentSector: string;
    originalValues: {
      valor_convenio: number;
      valor_recurso_proprio: number;
      valor_royalties: number;
    };
  } | null>(null);
  const [isUpdatingSector, setIsUpdatingSector] = useState(false);
  const [editingSectorId, setEditingSectorId] = useState<number | null>(null);

  const handleSectorClick = (processo: Processo, newSector: string) => {
    if (!newSector || processo.setor_atual === newSector) {
      setEditingSectorId(null);
      return;
    }

    setSectorToUpdate({
      processId: processo.id!,
      newSector,
      currentSector: processo.setor_atual,
      originalValues: {
        valor_convenio: processo.valor_convenio,
        valor_recurso_proprio: processo.valor_recurso_proprio,
        valor_royalties: processo.valor_royalties,
      },
    });
    setEditingSectorId(null);
  };

  const confirmSectorUpdate = async () => {
    if (!sectorToUpdate) return;

    setIsUpdatingSector(true);
    try {
      await api.patch(`/processos/${sectorToUpdate.processId}/setor`, {
        setor_atual: sectorToUpdate.newSector,
      });
      showNotification(
        `Setor atualizado para ${sectorToUpdate.newSector}`,
        "success",
      );
      onSearch(searchTerm); // Recarrega a lista mantendo a busca atual
      setSectorToUpdate(null);
    } catch (error) {
      console.error("Erro ao atualizar setor", error);
      showNotification("Erro ao atualizar o setor. Tente novamente.", "error");
    } finally {
      setIsUpdatingSector(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchTerm) {
        onSearch(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, searchTerm, onSearch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleLoadingPage = () => {
    setIsLoadingPage(true);
    router.push("/dashboard/novo-processo");
  };

  const getTotalValue = (processo: Processo) => {
    return (
      processo.valor_convenio +
      processo.valor_recurso_proprio +
      processo.valor_royalties
    );
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (value) => value !== null,
  );

  const activeFiltersCount = Object.values(selectedFilters).filter(
    (value) => value !== null,
  ).length;

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

    Object.keys(selectedFilters).forEach((key) => {
      const filterKey = key as keyof SelectedFilters;
      if (selectedFilters[filterKey] !== null) {
        onFilterChange(filterKey, null);
      }
    });
  };

  const renderFilterSubMenu = (
    filterType: keyof SelectedFilters,
    label: string,
    options: string[],
  ) => {
    const selectedValue = selectedFilters[filterType];

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "em_andamento":
          return "Em andamento";
        case "concluido":
          return "Concluído";
        default:
          return status;
      }
    };

    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <div className="flex items-center justify-between w-full">
            <span>{label}</span>
            {selectedValue && (
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {filterType === "status"
                    ? getStatusLabel(selectedValue)
                    : selectedValue}
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
              {filterType === "status" ? getStatusLabel(option) : option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };

  const handleEditProcess = (processo: Processo) => {
    const params = new URLSearchParams({
      id: processo.id?.toString() || "",
      numero_processo: processo.numero_processo,
      data_entrada: processo.data_entrada,
      competencia: processo.competencia,
      objeto: processo.objeto,
      credor: processo.credor || processo.interessado || "",
      orgao_gerador: processo.orgao_gerador,
      responsavel: processo.responsavel,
      setor_atual: processo.setor_atual,
      link_processo: processo.link_processo || "",
      descricao: processo.descricao,
      observacao: processo.observacao,
      valor_convenio: processo.valor_convenio.toString(),
      valor_recurso_proprio: processo.valor_recurso_proprio.toString(),
      valor_royalties: processo.valor_royalties.toString(),
      status: processo.status,
      mode: "edit",
    });

    router.push(`/dashboard/novo-processo?${params.toString()}`);
  };
  const formatDateLocal = (dateString: string) => {
    if (!dateString) return "...";

    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString("pt-BR");
  };

  // Função para expandir/contrair linha
  const toggleRowExpansion = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Componente para exibir detalhes do processo com animação

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "concluido":
        return {
          label: "Concluído",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case "em_andamento":
      default:
        return {
          label: "Em andamento",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
    }
  };

  return (
    <>
      {/* Adicione este CSS no início do componente ou em um arquivo CSS global */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .chevron-rotate {
          transition: transform 0.3s ease-in-out;
        }

        .chevron-rotate.expanded {
          transform: rotate(180deg);
        }
      `}</style>

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
              {onToggleShowCompleted && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showCompleted"
                    checked={showCompleted}
                    onCheckedChange={(checked) =>
                      onToggleShowCompleted(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="showCompleted"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Exibir Concluídos
                  </Label>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar processos..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-10 w-full sm:w-80 min-w-[250px]" // Aumentado de sm:w-64 para sm:w-80 (320px) e adicionado min-w para largura mínima
                  // disabled={isLoading} // Removido para evitar perda de foco
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    className="relative"
                  >
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

                  {renderFilterSubMenu(
                    "objeto",
                    "Objeto",
                    filterOptions.objetos,
                  )}

                  {renderFilterSubMenu(
                    "status",
                    "Status",
                    filterOptions.status,
                  )}

                  {renderFilterSubMenu("setor", "Setor", filterOptions.setores)}

                  {renderFilterSubMenu(
                    "credor",
                    "Credor",
                    filterOptions.credores,
                  )}

                  <DropdownMenuSeparator />

                  <div className="px-2 py-2">
                    <div className="text-sm font-medium mb-2">
                      Período de Entrada
                    </div>

                    <div className="mb-2">
                      <div className="text-xs text-slate-600 mb-1">
                        Data início:
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                          <Input
                            type="date"
                            placeholder="Data início"
                            value={selectedFilters.data_inicio || ""}
                            onChange={(e) =>
                              onFilterChange(
                                "data_inicio",
                                e.target.value || null,
                              )
                            }
                            className="pl-7 h-8 text-xs"
                            disabled={isLoading}
                          />
                        </div>
                        {selectedFilters.data_inicio && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFilterChange("data_inicio", null)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="text-xs text-slate-600 mb-1">
                        Data fim:
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                          <Input
                            type="date"
                            placeholder="Data fim"
                            value={selectedFilters.data_fim || ""}
                            onChange={(e) =>
                              onFilterChange("data_fim", e.target.value || null)
                            }
                            className="pl-7 h-8 text-xs"
                            disabled={isLoading}
                            min={selectedFilters.data_inicio || undefined}
                          />
                        </div>
                        {selectedFilters.data_fim && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFilterChange("data_fim", null)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {(selectedFilters.data_inicio ||
                      selectedFilters.data_fim) && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                        <strong>Período:</strong>{" "}
                        {formatDateLocal(selectedFilters.data_inicio || "")} até{" "}
                        {formatDateLocal(selectedFilters.data_fim || "")}
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

              {["admin", "user"].includes(userRole) && (
                <Button
                  onClick={handleLoadingPage}
                  className="w-full sm:w-auto cursor-pointer"
                  disabled={isLoadingPage}
                >
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
                  objeto: "Objeto",
                  status: "Status",
                  setor: "Setor",
                  credor: "Credor",
                  responsavel: "Responsável",
                  data_inicio: "Data início",
                  data_fim: "Data fim",
                };

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {labels[key as keyof typeof labels]}:{" "}
                    {key === "data_inicio" || key === "data_fim"
                      ? formatDateLocal(value)
                      : value}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onFilterChange(key as keyof SelectedFilters, null)
                      }
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
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>

                  <SortableHeader
                    field="numero_processo"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-28 min-w-28"
                  >
                    Número
                  </SortableHeader>

                  <SortableHeader
                    field="objeto"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-32 min-w-32 max-w-[140px]"
                  >
                    Objeto
                  </SortableHeader>

                  <SortableHeader
                    field="credor"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-36 min-w-36 max-w-[160px]"
                  >
                    Credor
                  </SortableHeader>

                  <SortableHeader
                    field="orgao_gerador"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-20 min-w-20 max-w-[100px]"
                  >
                    Órgão Gerador
                  </SortableHeader>

                  <SortableHeader
                    field="setor_atual"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-32 min-w-32 max-w-[140px]"
                  >
                    Setor Atual
                  </SortableHeader>

                  <SortableHeader
                    field="dias_no_setor"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-20 min-w-20"
                    align="center"
                  >
                    Tempo
                  </SortableHeader>

                  <SortableHeader
                    field="valor_total"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    className="w-28 min-w-28"
                    align="right"
                  >
                    Valor Total
                  </SortableHeader>

                  <TableHead className="w-16 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({
                        length: ["admin", "user"].includes(userRole) ? 9 : 8,
                      }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : processos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={["admin", "user"].includes(userRole) ? 9 : 8}
                      className="text-center py-8 text-slate-500"
                    >
                      {searchTerm || hasActiveFilters
                        ? "Nenhum processo encontrado"
                        : "Nenhum processo cadastrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  processos.flatMap((processo, index) => [
                    <TableRow
                      key={`main-${processo.id || index}`}
                      className="hover:bg-slate-50"
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(index)}
                          className="h-6 w-6 p-0 hover:bg-slate-200 transition-all duration-200"
                        >
                          <ChevronDown
                            className={`w-4 h-4 chevron-rotate ${
                              expandedRows.has(index) ? "expanded" : ""
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell
                        className="font-medium w-28 min-w-28 truncate"
                        title={processo.numero_processo}
                      >
                        <div className="flex items-center gap-2">
                          {processo.link_processo ? (
                            <a
                              href={processo.link_processo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {processo.numero_processo}
                            </a>
                          ) : (
                            <span>{processo.numero_processo}</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                processo.numero_processo,
                              );
                              showNotification(
                                "Número do processo copiado!",
                                "success",
                              );
                            }}
                            className="h-6 w-6 p-0 hover:bg-slate-200 transition-colors"
                            title="Copiar número do processo"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell
                        className="w-32 min-w-32 max-w-[140px] truncate"
                        title={processo.objeto}
                      >
                        {processo.objeto}
                      </TableCell>
                      <TableCell
                        className="w-36 min-w-36 max-w-[160px] truncate overflow-hidden"
                        title={processo.credor || processo.interessado}
                      >
                        {processo.credor || processo.interessado}
                      </TableCell>
                      <TableCell
                        className="w-20 min-w-20 max-w-[100px] truncate"
                        title={processo.orgao_gerador}
                      >
                        {processo.orgao_gerador}
                      </TableCell>
                      <TableCell
                        className="w-32 min-w-32 max-w-[140px]"
                        title={processo.setor_atual}
                      >
                        {editingSectorId === processo.id ? (
                          <div className="w-full min-w-[140px]">
                            <SearchableSelect
                              options={availableSectors}
                              value={processo.setor_atual}
                              onChange={(newValue) =>
                                handleSectorClick(processo, newValue)
                              }
                              placeholder="Selecione ou crie..."
                              isCreatable={true}
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="h-auto p-0 hover:bg-transparent w-full justify-start truncate"
                            onClick={() => setEditingSectorId(processo.id!)}
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 truncate max-w-full"
                            >
                              <span className="truncate">
                                {processo.setor_atual}
                              </span>
                              <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                            </Badge>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="w-20 min-w-20 text-center">
                        <Badge variant="secondary" className="font-normal">
                          {processo.dias_no_setor !== null &&
                          processo.dias_no_setor !== undefined
                            ? `${processo.dias_no_setor}d`
                            : "-"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="font-medium w-28 min-w-28 text-right truncate"
                        title={formatCurrency(getTotalValue(processo))}
                      >
                        {formatCurrency(getTotalValue(processo))}
                      </TableCell>
                      <TableCell className="w-16 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {(() => {
                            const statusColors: Record<string, string> = {
                              em_andamento: "bg-yellow-500",
                              concluido: "bg-green-500",
                            };
                            const statusLabels: Record<string, string> = {
                              em_andamento: "Em andamento",
                              concluido: "Concluído",
                            };
                            return (
                              <div
                                className={`w-3 h-3 rounded-full ${statusColors[processo.status] || "bg-gray-400"}`}
                                title={
                                  statusLabels[processo.status] ||
                                  processo.status
                                }
                              />
                            );
                          })()}
                          {["admin", "user"].includes(userRole) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProcess(processo)}
                              className="h-6 w-6 p-0 hover:bg-slate-200 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>,
                    <TableRow key={`details-${processo.id || index}`}>
                      <TableCell
                        colSpan={["admin", "user"].includes(userRole) ? 10 : 9}
                        className="p-0"
                      >
                        <ProcessDetails
                          processo={processo}
                          isExpanded={expandedRows.has(index)}
                        />
                      </TableCell>
                    </TableRow>,
                  ])
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-600">
                Mostrando{" "}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} a{" "}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems,
                )}{" "}
                de {pagination.totalItems} processos
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
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else {
                        const start = Math.max(1, pagination.currentPage - 2);
                        pageNumber = start + i;
                      }

                      if (pageNumber > pagination.totalPages) return null;

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pagination.currentPage === pageNumber
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => onPageChange(pageNumber)}
                          className="w-8 h-8 p-0 cursor-pointer"
                        >
                          {pageNumber}
                        </Button>
                      );
                    },
                  )}
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

      {/* Modal de Confirmação de Troca de Setor */}
      {sectorToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => !isUpdatingSector && setSectorToUpdate(null)}
          />

          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Confirmar alteração
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Deseja alterar o setor deste processo de{" "}
                <span className="font-medium text-slate-700">
                  "{sectorToUpdate.currentSector}"
                </span>{" "}
                para{" "}
                <span className="font-medium text-slate-700">
                  "{sectorToUpdate.newSector}"
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setSectorToUpdate(null)}
                disabled={isUpdatingSector}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmSectorUpdate}
                disabled={isUpdatingSector}
                className="flex-1 bg-black hover:bg-gray-900 text-white cursor-pointer"
              >
                {isUpdatingSector ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
