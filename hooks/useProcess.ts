import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import api from '@/services/api'

interface Processo {
  numero_processo: string
  data_entrada: string
  competencia: string
  objeto: string
  credor: string
  interessado?: string  // Mantém para compatibilidade
  orgao_gerador: string
  responsavel: string
  setor_atual: string
  link_processo?: string
  descricao: string
  observacao: string
  valor_convenio: number
  valor_recurso_proprio: number
  valor_royalties: number
  status: 'em_andamento' | 'concluido'
  update_for?: string
  createdAt?: string
  data_atualizacao?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface AllProcessosResponse {
  status: string
  valor_convenio: number
  valor_recurso_proprio: number
  valor_royalties: number
  total: number
}

interface ProcessosResponse {
  processos?: Processo[]
  rows?: Processo[]
  pagination?: PaginationInfo
  count?: number
}

interface ProcessFilters {
  busca?: string
  concluido?: boolean | string
  status?: string
  setor?: string
  objeto?: string
  data_inicio?: string
  data_fim?: string
  orgao_id?: string
  dateField?: string
}
interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

export const useProcess = () => {
  const [processos, setProcessos] = useState<Processo[]>([])
  const [isLoading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  
  // Persist itemsPerPage
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const storedItemsPerPage = localStorage.getItem('itemsPerPage');
      if (storedItemsPerPage) {
        setPagination(prev => ({ ...prev, itemsPerPage: Number(storedItemsPerPage) }));
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilters, setCurrentFilters] = useState<ProcessFilters>({})
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: 'asc' })
  const [processosStats, setProcessosStats] = useState({
    total: 0,
    concluidos: 0,
    emAndamento: 0,
    totalValorConvenio: 0,
    totalValorRecursoProprio: 0,
    totalValorRoyalties: 0
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      setPagination(prev => ({ ...prev, currentPage: Number(pageParam) }))
    }
  }, [searchParams])

  const calcularTotaisFinanceirosProcessos = (processos: AllProcessosResponse[]) => {
    return processos.reduce((acc, processo) => {
      acc.totalValorConvenio += processo.valor_convenio || 0
      acc.totalValorRecursoProprio += processo.valor_recurso_proprio || 0
      acc.totalValorRoyalties += processo.valor_royalties || 0
      return acc
    }, {
      totalValorConvenio: 0,
      totalValorRecursoProprio: 0,
      totalValorRoyalties: 0
    })
  }

  const fetchAllProcessos = async () => {
    try {
      const response = await api.get('/processos/listar-todos')
      const data: AllProcessosResponse[] = response.data.processos

      const totaisFinanceiros = calcularTotaisFinanceirosProcessos(data)

      const processosStats = {
        total: data.length,
        concluidos: data.filter(p => p?.status === 'concluido').length,
        emAndamento: data.filter(p => p?.status === 'em_andamento').length,
        ...totaisFinanceiros
      }

      setProcessosStats(processosStats)
    } catch {

    }
  }

  const fetchProcessos = async (
    page: number = 1,
    search: string = "",
    filters: ProcessFilters = {},
    sort: SortConfig = { field: '', direction: 'asc' },
    limit?: number
  ) => {
    setLoading(true)
    try {
      // Prioritize limit arg, then localStorage, then state, then default
      let itemsPerPage = limit || pagination.itemsPerPage;
      if (!limit && typeof window !== 'undefined') {
         const stored = localStorage.getItem('itemsPerPage');
         if (stored) itemsPerPage = Number(stored);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      })

      if (search.trim()) {
        params.append('busca', search.trim())
      }

      if (filters.status) {
        params.append('status', filters.status)
      }
      if (filters.setor) {
        params.append('setor', filters.setor)
      }
      if (filters.objeto) {
        params.append('objeto', filters.objeto)
      }
      if (filters.data_inicio) {
        params.append('data_inicio', filters.data_inicio)
      }
      if (filters.data_fim) {
        params.append('data_fim', filters.data_fim)
      }
      if (filters.dateField) {
        params.append('dateField', filters.dateField)
      }
      if (filters.orgao_id) {
        params.append('orgao_id', filters.orgao_id)
      }
      if (sort.field) {
        params.append('sortBy', sort.field)
        params.append('sortOrder', sort.direction)
      }

      const response = await api.get(`/processos?${params}`)
      const data: ProcessosResponse = response.data

      let processosData: Processo[] = []
      const currentItemsPerPage = limit || pagination.itemsPerPage
      let paginationData: PaginationInfo = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: currentItemsPerPage
      }

      if (data.processos) {
        processosData = data.processos
        paginationData = data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: data.processos.length,
          itemsPerPage: currentItemsPerPage
        }
      } else if (data.rows) {
        processosData = data.rows
        paginationData = {
          currentPage: page,
          totalPages: Math.ceil((data.count || 0) / currentItemsPerPage),
          totalItems: data.count || 0,
          itemsPerPage: currentItemsPerPage
        }
      } else if (Array.isArray(data)) {
        processosData = data
        paginationData = {
          currentPage: page,
          totalPages: 1,
          totalItems: data.length,
          itemsPerPage: currentItemsPerPage
        }
      }

      // UX Improvement: Auto-navigate to previous page if current page is empty
      if (processosData.length === 0 && page > 1) {
         fetchProcessos(page - 1, search, filters, sort, limit);
         return; 
      }

      setProcessos(processosData)
      setPagination(paginationData)
      localStorage.setItem("processos", JSON.stringify(processosData))
      localStorage.setItem("processos_pagination", JSON.stringify(paginationData))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/auth/login")
          return
        }
      }

      setProcessos([])
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      })

      setProcessosStats({
        total: 0,
        concluidos: 0,
        emAndamento: 0,
        totalValorConvenio: 0,
        totalValorRecursoProprio: 0,
        totalValorRoyalties: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchProcessos(page, searchTerm, currentFilters)
    }
  }
  const searchProcessos = (term: string) => {
    setSearchTerm(term)
    fetchProcessos(1, term, currentFilters)
  }

  const applyFilters = (filters: ProcessFilters, page: number = 1) => {
    setCurrentFilters(filters)
    fetchProcessos(page, searchTerm, filters)
  }

  const clearFilters = () => {
    setCurrentFilters({})
    fetchProcessos(1, searchTerm, {})
  }

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1)
    }
  }

  const previousPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1)
    }
  }

  useEffect(() => {
    // fetchProcessos() // Removido para controle via componente pai
    fetchAllProcessos()
  }, [])

  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc'

    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    const newSortConfig = { field, direction }
    setSortConfig(newSortConfig)
    fetchProcessos(1, searchTerm, currentFilters, newSortConfig)
  }

  const changeItemsPerPage = (newLimit: number) => {
    localStorage.setItem('itemsPerPage', newLimit.toString());
    fetchProcessos(1, searchTerm, currentFilters, sortConfig, newLimit)
  }

  return {
    processos: processos || [],
    isLoading,
    pagination,
    processosStats,
    searchTerm,
    currentFilters,
    sortConfig,
    handleSort,
    goToPage,
    nextPage,
    previousPage,
    changeItemsPerPage,
    searchProcessos,
    fetchAllProcessos,
    fetchProcessos,
    applyFilters,
    clearFilters,
    refetch: () => fetchProcessos(pagination?.currentPage || 1, searchTerm, currentFilters)
  }
}

export type { ProcessFilters }