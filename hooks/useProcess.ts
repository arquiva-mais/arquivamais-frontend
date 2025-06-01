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
  const router = useRouter()

  const fetchProcessos = async (page: number = 1, search: string = "") => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString()
      })

      if (search.trim()) {
        params.append('busca', search.trim())
      }

      const response = await api.get(`http://localhost:3000/processos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })


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
      fetchProcessos(page, searchTerm)
    }
  }

  const searchProcessos = (search: string) => {
    setSearchTerm(search)
    fetchProcessos(1, search)
  }

  // Função para próxima página
  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1)
    }
  }

  // Função para página anterior
  const previousPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1)
    }
  }

  useEffect(() => {
    fetchProcessos()
  }, [])

  // Stats calculados de forma segura
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
    // Funções de controle
    goToPage,
    nextPage,
    previousPage,
    searchProcessos,
    refetch: () => fetchProcessos(pagination?.currentPage || 1, searchTerm)
  }
}