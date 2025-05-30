"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/ui/header"
import { StatsCards } from "@/components/ui/statsCards"
import { ProcessTable } from "@/components/ui/processTable"
import { useProcess } from "@/hooks/useProcess"

import { decodeJwt } from 'jose'

interface TokenPayload {
  id?: string
  email?: string
  role?: string
  exp?: number
  iat?: number
  [key: string]: any
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const router = useRouter()
  const { processos, processosStats } = useProcess()

  const decodedToken = (token: string) => {
    try {
      return decodeJwt(token) as TokenPayload
    } catch (error) {
      console.log("Erro ao decodificar.")
      return null
    }
  }

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const username = localStorage.getItem("userName")

    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = decodedToken(token)

      if (payload && payload.role) {
        setUserRole(payload.role)
      }
    } else {
      console.log("Token not found.");
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
        />

        <ProcessTable processos={processos} userRole={userRole} />
      </main>
    </div>
  )
}