import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

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

export const useProcess = () => {
  const [processos, setProcessos] = useState<Processo[]>([])
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()

  const fetchProcessos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")

      const response = await axios.get('http://localhost:3000/processos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setProcessos(response.data)
    } catch (error) {
      console.error('Erro ao buscar processos:', error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/auth/login")
          return
        }

        // Aqui você pode usar o toast em vez de alert
        const errorMessage = error.response?.data?.message || 'Erro ao carregar processos'
        console.error(errorMessage)
      }

      // Em caso de erro, usar dados do localStorage se existirem
      const savedProcessos = localStorage.getItem("processos")
      if (savedProcessos) {
        setProcessos(JSON.parse(savedProcessos))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcessos()
  }, [])

  const processosStats = {
    total: processos.length,
    concluidos: processos.filter(p => p.concluido).length,
    emAndamento: processos.filter(p => !p.concluido).length
  }

  return {
    processos,
    isLoading,
    processosStats,
    refetch: fetchProcessos
  }
}