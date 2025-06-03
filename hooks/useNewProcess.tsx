import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import api from '@/services/api'

export interface NovoProcesso {
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
}

const initialFormData: NovoProcesso = {
  numero_processo: "",
  data_entrada: new Date().toISOString().split("T")[0],
  competencia: '',
  objeto: "",
  interessado: "",
  orgao_gerador: "",
  responsavel: "",
  setor_atual: "",
  descricao: "",
  observacao: "",
  valor_convenio: 0,
  valor_recurso_proprio: 0,
  valor_royalties: 0,
}

export const useNewProcess = () => {
  const [formData, setFormData] = useState<NovoProcesso>(initialFormData)
  const [editFormData, setEditFormData] = useState<NovoProcesso>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleInputChange = (field: keyof NovoProcesso, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleNumberChange = (field: keyof NovoProcesso, value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value)
    handleInputChange(field, isNaN(numericValue) ? 0 : numericValue)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero_processo.trim()) {
      newErrors.numero_processo = 'Número do processo é obrigatório'
    }
    if (!formData.data_entrada) {
      newErrors.data_entrada = 'Data de entrada é obrigatória'
    }
    if (!formData.competencia) {
      newErrors.competencia = 'Competência é obrigatória'
    }
    if (!formData.objeto) {
      newErrors.objeto = 'Objeto é obrigatório'
    }
    if (!formData.interessado.trim()) {
      newErrors.interessado = 'Interessado é obrigatório'
    }
    if (!formData.orgao_gerador.trim()) {
      newErrors.orgao_gerador = 'Órgão Gerador é obrigatório'
    }
    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório'
    }
    if (!formData.setor_atual) {
      newErrors.setor_atual = 'Setor Atual é obrigatório'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return false
    }

    return true
  }

  const submitForm = async (onSuccess?: () => void, onError?: (message: string) => void) => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")

      await api.post('/processos', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      onSuccess?.()
      router.push("/dashboard")
    } catch (error) {

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/")
          return
        }

        const errorMessage = error.response?.data?.error || 'Erro ao criar processo'
        onError?.(errorMessage)
      } else {
        onError?.('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const editForm = async (editFormData: any, idProcess?: number, onSuccess?: () => void, onError?: (message: string) => void) => {
    //if (!validateForm()) return
    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")

      await api.put(`/processos/${idProcess}`, editFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      onSuccess?.()
      router.push("/dashboard")
    } catch (error) {

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/")
          return
        }

        const errorMessage = error.response?.data?.error || 'Erro ao criar processo'
        onError?.(errorMessage)
      } else {
        onError?.('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const deletProcess = async (idProcess?: number, onSuccess?: () => void, onError?: (message: string) => void) => {
    //if (!validateForm()) return
    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")

      await api.delete(`/processos/${idProcess}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      onSuccess?.()
      router.push("/dashboard")
    } catch (error) {

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/")
          return
        }

        const errorMessage = error.response?.data?.error || 'Erro ao criar processo'
        onError?.(errorMessage)
      } else {
        onError?.('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getTotalValue = () => {
    return (formData.valor_convenio || 0) + (formData.valor_recurso_proprio || 0) + (formData.valor_royalties || 0)
  }

  return {
    formData,
    editFormData,
    loading,
    errors,
    handleInputChange,
    handleNumberChange,
    submitForm,
    getTotalValue,
    validateForm,
    editForm,
    deletProcess
  }
}