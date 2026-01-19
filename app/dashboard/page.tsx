"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/ui/header"
// import { StatsCards } from "@/components/ui/statsCards"
import { ProcessTable } from "@/components/ui/processTable"
import { useProcess, type ProcessFilters } from "@/hooks/useProcess"

import { decodeJwt } from 'jose'

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
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const router = useRouter()

  // ✅ Estado atualizado
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    objeto: null,
    status: null,
    setor: null,
    credor: null,
    responsavel: null,
    data_inicio: null,
    data_fim: null,
  })

  // Novo estado para o toggle
  const [showCompleted, setShowCompleted] = useState(false)

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
    changeItemsPerPage
  } = useProcess()

  const decodedToken = (token: string) => {
    try {
      return decodeJwt(token) as TokenPayload
    } catch {
      return null
    }
  }

  const buildBackendFilters = (filters: SelectedFilters, showCompletedState: boolean) => {
    const backendFilters: ProcessFilters = {}

    if (!showCompletedState) {
      backendFilters.status = 'em_andamento'
    }

    if (filters.objeto) backendFilters.objeto = filters.objeto
    if (filters.setor) backendFilters.setor = filters.setor
    if (filters.credor) backendFilters.busca = filters.credor
    if (filters.data_inicio) backendFilters.data_inicio = filters.data_inicio
    if (filters.data_fim) backendFilters.data_fim = filters.data_fim

    return backendFilters
  }

  const handleFilterChange = (filterType: keyof SelectedFilters, value: string | null) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    }

    setSelectedFilters(newFilters)
    const backendFilters = buildBackendFilters(newFilters, showCompleted)
    applyFilters(backendFilters)
  }

  const handleToggleShowCompleted = (checked: boolean) => {
    setShowCompleted(checked)
    const backendFilters = buildBackendFilters(selectedFilters, checked)
    applyFilters(backendFilters)
  }

  // Initial fetch respecting the default state (showCompleted=false)
  useEffect(() => {
    const initialFilters = buildBackendFilters(selectedFilters, showCompleted)
    applyFilters(initialFilters)
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
          showCompleted={showCompleted}
          onToggleShowCompleted={handleToggleShowCompleted}
          onItemsPerPageChange={changeItemsPerPage}
        />
      </main>
    </div>
  )
}