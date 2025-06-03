import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import api from '@/services/api'

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

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
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
  setor?: string
  objeto?: string
  data_inicio?: string
  data_fim?: string
  orgao_id?: string
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
  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilters, setCurrentFilters] = useState<ProcessFilters>({})
  const router = useRouter()

  const fetchProcessos = async (
    page: number = 1,
    search: string = "",
    filters: ProcessFilters = {}
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString()
      })

      if (search.trim()) {
        params.append('busca', search.trim())
      }

      if (filters.concluido !== undefined) {
        params.append('concluido', String(filters.concluido))
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
      if (filters.orgao_id) {
        params.append('orgao_id', filters.orgao_id)
      }

      const response = await api.get(`/processos?${params}`)
      const data: ProcessosResponse = response.data

      let processosData: Processo[] = []
      let paginationData: PaginationInfo = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: pagination.itemsPerPage
      }

      if (data.processos) {
        processosData = data.processos
        paginationData = data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: data.processos.length,
          itemsPerPage: 10
        }
      } else if (data.rows) {
        processosData = data.rows
        paginationData = {
          currentPage: page,
          totalPages: Math.ceil((data.count || 0) / pagination.itemsPerPage),
          totalItems: data.count || 0,
          itemsPerPage: pagination.itemsPerPage
        }
      } else if (Array.isArray(data)) {
        processosData = data
        paginationData = {
          currentPage: page,
          totalPages: 1,
          totalItems: data.length,
          itemsPerPage: pagination.itemsPerPage
        }
      }

      setProcessos(processosData)
      setPagination(paginationData)
      console.log(processosData)
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
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchProcessos(page, searchTerm, currentFilters)
    }
  }

  const searchProcessos = (search: string) => {
    setSearchTerm(search)
    fetchProcessos(1, search, currentFilters)
  }

  const applyFilters = (filters: ProcessFilters) => {
    setCurrentFilters(filters)
    fetchProcessos(1, searchTerm, filters)
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
    fetchProcessos()
  }, [])

  const processosStats = {
    total: pagination?.totalItems || 0,
    concluidos: (processos || []).filter(p => p?.concluido === true).length,
    emAndamento: (processos || []).filter(p => p?.concluido === false).length
  }

  return {
    processos: processos || [],
    isLoading,
    pagination,
    processosStats,
    searchTerm,
    currentFilters,
    goToPage,
    nextPage,
    previousPage,
    searchProcessos,
    fetchProcessos,
    applyFilters,
    clearFilters,
    refetch: () => fetchProcessos(pagination?.currentPage || 1, searchTerm, currentFilters)
  }
}

export type { ProcessFilters }