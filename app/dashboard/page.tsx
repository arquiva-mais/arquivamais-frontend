"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/ui/header"
// import { StatsCards } from "@/components/ui/statsCards"
import { ProcessTable } from "@/components/ui/processTable"
import { useProcess, type ProcessFilters } from "@/hooks/useProcess"

import { decodeJwt } from 'jose'

function DashboardContent() {
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams() // Moved up for scope access

  // ✅ Estado atualizado
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    objeto: null,
    status: 'em_andamento', // Default explícito
    setor: null,
    credor: null,
    responsavel: null,
    data_inicio: null,
    data_fim: null,
    dateField: null
  })

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    objetos: [],
    status: [], // Empty status options so dropdown is hidden/empty
    setores: [],
    credores: [],
    responsaveis: [],
  })

  const {
    processos,
    isLoading,
    pagination,
    processosStats,
    searchTerm,
    sortConfig,
    handleSort,
    //currentFilters,
    goToPage,
    nextPage,
    previousPage,
    searchProcessos,
    applyFilters,
    //clearFilters
    changeItemsPerPage,
    refetch
  } = useProcess()

  const decodedToken = (token: string) => {
    try {
      return decodeJwt(token) as TokenPayload
    } catch {
      return null
    }
  }

  const buildBackendFilters = (filters: SelectedFilters) => {
    const backendFilters: ProcessFilters = {
      // Default: em_andamento se não especificado
      status: filters.status || 'em_andamento'
    }

    if (filters.status === 'todos') {
      delete backendFilters.status; // Remove o filtro para trazer todos
    } else if (filters.status) {
      backendFilters.status = filters.status;
    }

    if (filters.objeto) backendFilters.objeto = filters.objeto
    if (filters.setor) backendFilters.setor = filters.setor
    if (filters.credor) backendFilters.busca = filters.credor
    if (filters.data_inicio) backendFilters.data_inicio = filters.data_inicio
    if (filters.data_fim) backendFilters.data_fim = filters.data_fim
    // Sempre enviar dateField, usando o valor selecionado ou o padrão
    backendFilters.dateField = filters.dateField || 'data_entrada'
    // Filtro de prioridade
    if (filters.filterPriority) backendFilters.filterPriority = true

    return backendFilters
  }

  const handleFilterChange = (filterType: keyof SelectedFilters, value: string | boolean | null) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    }

    setSelectedFilters(newFilters)
    const backendFilters = buildBackendFilters(newFilters)
    // Always reset to page 1 on filter change
    applyFilters(backendFilters, 1)
  }

  // Initial fetch respecting the default state and URL params

  useEffect(() => {
    // Get initial page from URL or default to 1
    const pageParam = searchParams.get('page')
    const initialPage = pageParam ? parseInt(pageParam) : 1

    // Inicializa com status 'em_andamento'
    if (!selectedFilters.status) {
      setSelectedFilters(prev => ({ ...prev, status: 'em_andamento' }))
      applyFilters({ status: 'em_andamento' }, initialPage)
    } else {
      const initialFilters = buildBackendFilters(selectedFilters)
      applyFilters(initialFilters, initialPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (processos.length > 0) {
      const objetos = [...new Set(processos.map(p => p.objeto).filter(Boolean))]
      const setores = [...new Set(processos.map(p => p.setor_atual).filter(Boolean))]
      const credores = [...new Set(processos.map(p => p.credor || p.interessado).filter(Boolean))] as string[]
      const responsaveis = [...new Set(processos.map(p => p.responsavel).filter(Boolean))] as string[]

      setFilterOptions(prev => ({
        ...prev,
        objetos,
        setores,
        credores,
        responsaveis,
      }))
    }
  }, [processos])

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const username = localStorage.getItem("userName")

    const token = localStorage.getItem("authToken")
    if (token) {
      const payload = decodedToken(token)

      if (payload && payload.role) {
        setUserRole(payload.role)
      }
    } else {
      console.log("Token not found.")
    }

    if (!isAuthenticated) {
      router.push("/")
      return
    }

    setUserName(username || "")
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader username={userName} onLogout={handleLogout} />

      <main className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ProcessTable
          processos={processos}
          userRole={userRole}
          isLoading={isLoading}
          pagination={pagination}
          searchTerm={searchTerm}
          onPageChange={goToPage}
          onSearch={searchProcessos}
          onRefresh={refetch}
          onNextPage={nextPage}
          onPreviousPage={previousPage}
          filterOptions={{
            objetos: filterOptions.objetos,
            status: filterOptions.status,
            setores: filterOptions.setores,
            credores: filterOptions.credores,
            responsaveis: filterOptions.responsaveis,
          }}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          sortConfig={sortConfig}
          onSort={handleSort}
          showCompleted={false} // Deprecated prop
          onToggleShowCompleted={() => {}} // Deprecated prop
          onItemsPerPageChange={changeItemsPerPage}
        />
      </main>
    </div>
  )
}

interface TokenPayload {
  id?: string
  email?: string
  role?: string
  exp?: number
  iat?: number
  [key: string]: string | number | undefined
}

interface FilterOptions {
  objetos: string[]
  status: string[]
  setores: string[]
  credores: string[]
  responsaveis: string[]
}

interface SelectedFilters {
  objeto: string | null
  status: string | null
  setor: string | null
  credor: string | null
  responsavel: string | null
  data_inicio: string | null
  data_fim: string | null
  dateField: string | null
  filterPriority?: boolean
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}