"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/ui/header"
import { StatsCards } from "@/components/ui/statsCards"
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
  interessados: string[]
  responsaveis: string[]
}

interface SelectedFilters {
  objeto: string | null
  status: string | null
  setor: string | null
  interessado: string | null
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
    interessado: null,
    responsavel: null,
    data_inicio: null,
    data_fim: null,
  })

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    objetos: [],
    status: ["Concluído", "Em andamento", "Cancelado"],
    setores: [],
    interessados: [],
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
  } = useProcess()

  const decodedToken = (token: string) => {
    try {
      return decodeJwt(token) as TokenPayload
    } catch {
      return null
    }
  }

  const handleFilterChange = (filterType: keyof SelectedFilters, value: string | null) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    }

    setSelectedFilters(newFilters)

    const backendFilters: ProcessFilters = {}

    if (newFilters.status === 'Concluído'){
      newFilters.status = 'concluido'
    } 
    else if (newFilters.status === 'Em andamento') {
      newFilters.status = 'em_andamento'
    }
    else if (newFilters.status === 'Cancelado') {
      newFilters.status = 'cancelado'
    }
    else {
      newFilters.status = ''
    }

    if (newFilters.objeto) {
      backendFilters.objeto = newFilters.objeto
    }

    if (newFilters.status) {
      backendFilters.status = newFilters.status
    }

    if (newFilters.setor) {
      backendFilters.setor = newFilters.setor
    }

    if (newFilters.interessado) {
      backendFilters.busca = newFilters.interessado
    }

    if (newFilters.data_inicio) {
      backendFilters.data_inicio = newFilters.data_inicio
    }

    if (newFilters.data_fim) {
      backendFilters.data_fim = newFilters.data_fim
    }

    applyFilters(backendFilters)
  }

  useEffect(() => {
    if (processos.length > 0) {
      const objetos = [...new Set(processos.map(p => p.objeto).filter(Boolean))]
      const setores = [...new Set(processos.map(p => p.setor_atual).filter(Boolean))]
      const interessados = [...new Set(processos.map(p => p.interessado).filter(Boolean))]
      const responsaveis = [...new Set(processos.map(p => p.responsavel).filter(Boolean))]

      setFilterOptions(prev => ({
        ...prev,
        objetos,
        setores,
        interessados,
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards
          totalProcessos={processosStats.total}
          processosConcluidos={processosStats.concluidos}
          processosEmAndamento={processosStats.emAndamento}
          processosCancelados={processosStats.cancelados}
          totalValorConvenio={processosStats.totalValorConvenio}
          totalValorRecursoProprio={processosStats.totalValorRecursoProprio}
          totalValorRoyalties={processosStats.totalValorRoyalties}
        />

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
            interessados: filterOptions.interessados,
            responsaveis: filterOptions.responsaveis,
          }}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </main>
    </div>
  )
}