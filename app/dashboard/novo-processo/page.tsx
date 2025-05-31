"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import Link from "next/link"
import { ProcessoHeader } from "@/components/newProcessComponents/headerNewProcess"
import { InformacoesBasicas } from "@/components/newProcessComponents/basicsInfo"
import { ValoresProcesso } from "@/components/newProcessComponents/valueProcess"
import { useNewProcess } from "@/hooks/useNewProcess"
import { useNotification } from "@/hooks/useNotification"
import { ToastContainer } from "@/components/containers/toastContainer"
import { useToast } from "@/components/providers/toastProvider"

export default function NovoProcessoPage() {
  const router = useRouter()
  const {
    formData,
    loading,
    errors,
    handleInputChange,
    handleNumberChange,
    submitForm,
    getTotalValue,
    validateForm
  } = useNewProcess()

  const { showNotification } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    submitForm(
      () => {
        showNotification("Processo criado com sucesso!", 'success')
        setIsLoading(false)
      },
      (error) => {
        showNotification(error, 'error')
        setIsLoading(false)
      }
    )
  }

  const handleLoading = () => {
    setIsLoading(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ProcessoHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InformacoesBasicas
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            isLoading={isLoading}
            onStopLoading={() => setIsLoading(false)}
          />

          <ValoresProcesso
            formData={formData}
            onNumberChange={handleNumberChange}
            totalValue={getTotalValue()}
          />

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto cursor-pointer">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleLoading}
              className="w-full sm:w-auto cursor-pointer">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Processo
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}