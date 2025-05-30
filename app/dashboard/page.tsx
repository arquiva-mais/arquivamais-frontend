"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/ui/header"
import { StatsCards } from "@/components/ui/statsCards"
import { ProcessTable } from "@/components/ui/processTable"
import { useProcess } from "@/hooks/useProcess"

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("")
  const router = useRouter()
  const { processos, processosStats } = useProcess()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const email = localStorage.getItem("userEmail")
    const role = localStorage.getItem("role") || ""

    if (!isAuthenticated) {
      router.push("/")
      return
    }

    setUserEmail(email || "")
    setUserRole(role)
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

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