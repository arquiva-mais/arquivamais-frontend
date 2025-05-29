"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, FileText } from "lucide-react"
import Link from "next/link"
import axios from 'axios'

interface NovoProcesso {
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

export default function NovoProcessoPage() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const objetos = [
    'Adiantamento',
    'Aluguel Imóveis',
    'Aluguel Veículos',
    'Carnaval',
    'Combustível',
    'Contas Pagamentos',
    'Convênios',
    'Diárias',
    'Dotação',
    'Eventos/Comunicação',
    'Fundações',
    'Obras',
    'Premiações Mestre Antônio',
    'Premiações Mestre Eduardo',
    'Softwares e Consultoria'
  ]

  const setores =
    [
      'Gabinete',
      'Contabilidade',
      'Controle Interno',
      'Financeiro'
    ]

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const [formData, setFormData] = useState<NovoProcesso>({
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
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }
  }, [router])

  const handleInputChange = (field: keyof NovoProcesso, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpar erros anteriores
    setErrors({})

    const newErrors: Record<string, string> = {}

    // Validar campos obrigatórios
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

    // Se houver erros, focar no primeiro campo com erro
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")

      const response = await axios.post('http://localhost:3000/processos', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Processo criado:', response.data)
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao salvar processo:", error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/")
          return
        }

        const errorMessage = error.response?.data?.message || 'Erro ao criar processo'
        alert(errorMessage)
      } else {
        alert('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Função para limpar erro quando campo for alterado
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleNumberChange = (field: keyof NovoProcesso, value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value)
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(numericValue) ? 0 : numericValue,
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Novo Processo</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero_processo">Número do Processo *</Label>
                  <Input
                    id="numero_processo"
                    value={formData.numero_processo}
                    onChange={(e) => {
                      handleInputChange("numero_processo", e.target.value)
                      clearError("numero_processo")
                    }}
                    placeholder="2025/007891"
                    className={`bg-slate-50 ${errors.numero_processo ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.numero_processo && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.numero_processo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_entrada">Data de Entrada *</Label>
                  <Input
                    id="data_entrada"
                    type="date"
                    value={formData.data_entrada}
                    onChange={(e) => {
                      handleInputChange("data_entrada", e.target.value)
                      clearError("data_entrada")
                    }}
                    className={errors.data_entrada ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.data_entrada && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.data_entrada}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competencia">Competência *</Label>
                  <Select
                    value={formData.competencia}
                    onValueChange={(value) => {
                      handleInputChange("competencia", value)
                      clearError("competencia")
                    }}
                  >
                    <SelectTrigger
                      id="competencia"
                      className={errors.competencia ? 'border-red-500 focus:border-red-500' : ''}
                    >
                      <SelectValue placeholder="Selecione a competência" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((mes) => (
                        <SelectItem key={mes} value={mes}>
                          {mes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.competencia && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.competencia}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objeto">Objeto *</Label>
                <Select
                  value={formData.objeto}
                  onValueChange={(value) => {
                    handleInputChange("objeto", value)
                    clearError("objeto")
                  }}
                >
                  <SelectTrigger
                    id="objeto"
                    className={errors.objeto ? 'border-red-500 focus:border-red-500' : ''}
                  >
                    <SelectValue placeholder="Selecione o objeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {objetos.map((objeto, index) => (
                      <SelectItem key={index} value={objeto}>
                        {objeto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.objeto && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.objeto}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interessado">Interessado *</Label>
                  <Input
                    id="interessado"
                    value={formData.interessado}
                    onChange={(e) => {
                      handleInputChange("interessado", e.target.value)
                      clearError("interessado")
                    }}
                    placeholder="Ex: Secretaria de Educação"
                    className={errors.interessado ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.interessado && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.interessado}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgao_gerador">Órgão Gerador *</Label>
                  <Input
                    id="orgao_gerador"
                    value={formData.orgao_gerador}
                    onChange={(e) => {
                      handleInputChange("orgao_gerador", e.target.value)
                      clearError("orgao_gerador")
                    }}
                    placeholder="Ex: Secretaria de Educação"
                    className={errors.orgao_gerador ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.orgao_gerador && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.orgao_gerador}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => {
                      handleInputChange("responsavel", e.target.value)
                      clearError("responsavel")
                    }}
                    placeholder="Nome do responsável"
                    className={errors.responsavel ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.responsavel && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.responsavel}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor_atual">Setor Atual *</Label>
                  <Select
                    value={formData.setor_atual}
                    onValueChange={(value) => {
                      handleInputChange("setor_atual", value)
                      clearError("setor_atual")
                    }}
                  >
                    <SelectTrigger
                      id="setor_atual"
                      className={errors.setor_atual ? 'border-red-500 focus:border-red-500' : ''}
                    >
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {setores.map((setor, index) => (
                        <SelectItem key={index} value={setor}>
                          {setor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.setor_atual && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.setor_atual}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => {
                    handleInputChange("descricao", e.target.value)
                    clearError("descricao")
                  }}
                  placeholder="Descreva os detalhes do processo..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => handleInputChange("observacao", e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_convenio">Valor Convênio</Label>
                  <Input
                    id="valor_convenio"
                    type="number"
                    step="0.01"
                    value={formData.valor_convenio === 0 ? "" : formData.valor_convenio}
                    onChange={(e) => handleNumberChange("valor_convenio", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_recurso_proprio">Valor Recurso Próprio</Label>
                  <Input
                    id="valor_recurso_proprio"
                    type="number"
                    step="0.01"
                    value={formData.valor_recurso_proprio === 0 ? "" : formData.valor_recurso_proprio}
                    onChange={(e) => handleNumberChange("valor_recurso_proprio", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_royalties">Valor Royalties</Label>
                  <Input
                    id="valor_royalties"
                    type="number"
                    step="0.01"
                    value={formData.valor_royalties === 0 ? "" : formData.valor_royalties}
                    onChange={(e) => handleNumberChange("valor_royalties", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor Total:</span>
                  <span className="text-xl font-bold text-slate-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format((formData.valor_convenio || 0) + (formData.valor_recurso_proprio || 0) + (formData.valor_royalties || 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Processo"}
            </Button>
          </div>
        </form>
      </main>
    </div >
  )
}
