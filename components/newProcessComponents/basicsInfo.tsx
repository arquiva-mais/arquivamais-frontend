import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { OBJETOS_PROCESSO, SETORES, MESES } from "@/utils/newProcessConsts"
import { NovoProcesso } from "@/hooks/useNewProcess"
import api from "@/services/api"

// Constantes para os status
const STATUS_OPTIONS = [
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
]

interface InformacoesBasicasProps {
  formData: NovoProcesso
  errors: Record<string, string>
  onInputChange: (field: keyof NovoProcesso, value: string | number) => void
  isLoading?: boolean,
  onStopLoading: () => void,
  isEditMode: boolean
}

export const InformacoesBasicas: React.FC<InformacoesBasicasProps> = ({
  formData,
  errors,
  onInputChange,
  isLoading,
  isEditMode = false,
  onStopLoading
}) => {
  const [credorSuggestions, setCredorSuggestions] = useState<string[]>([])
  const [orgaoSuggestions, setOrgaoSuggestions] = useState<string[]>([])

  // Buscar sugestões de credores já cadastrados
  useEffect(() => {
    const fetchCredores = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await api.get('/processos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.data?.data) {
          const credores = [...new Set(response.data.data.map((p: any) => p.credor || p.interessado).filter(Boolean))] as string[]
          setCredorSuggestions(credores)
        }
      } catch (error) {
        console.error('Erro ao buscar credores:', error)
      }
    }

    fetchCredores()
  }, [])

  // Buscar sugestões de órgãos geradores já cadastrados
  useEffect(() => {
    const fetchOrgaos = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await api.get('/orgaos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.data) {
          const orgaos = response.data.map((o: any) => o.nome).filter(Boolean)
          setOrgaoSuggestions(orgaos)
        }
      } catch (error) {
        console.error('Erro ao buscar órgãos:', error)
      }
    }

    fetchOrgaos()
  }, [])

  const renderError = (field: string) => {
    if (isEditMode || !errors[field] || isLoading) {
      return null
    } else {
      onStopLoading()
      return (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {errors[field]}
        </p>
      )
    }
  }

  // Função para aplicar classes de erro condicionalmente
  const getErrorClass = (field: string) => {
    return !isEditMode && errors[field] ? 'border-red-500 focus:border-red-500' : ''
  }

  return (
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
              onChange={(e) => onInputChange("numero_processo", e.target.value)}
              placeholder="2025/007891"
              className={`bg-slate-50 ${getErrorClass("numero_processo")}`}
            />
            {renderError("numero_processo")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_entrada">Data de Entrada *</Label>
            <Input
              id="data_entrada"
              type="date"
              value={formData.data_entrada}
              onChange={(e) => onInputChange("data_entrada", e.target.value)}
              className={getErrorClass("data_entrada")}
            />
            {renderError("data_entrada")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="competencia">Competência *</Label>
            <Select
              value={formData.competencia}
              onValueChange={(value) => onInputChange("competencia", value)}
            >
              <SelectTrigger
                id="competencia"
                className={getErrorClass("competencia")}
              >
                <SelectValue placeholder="Selecione a competência" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes) => (
                  <SelectItem key={mes} value={mes}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError("competencia")}
          </div>
        </div>

        {/* Objeto e Órgão Gerador lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="objeto">Objeto *</Label>
            <SearchableSelect
              id="objeto"
              options={OBJETOS_PROCESSO}
              value={formData.objeto}
              onChange={(value) => onInputChange("objeto", value)}
              placeholder="Digite para buscar o objeto..."
              className={getErrorClass("objeto")}
            />
            {renderError("objeto")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgao_gerador">Órgão Gerador *</Label>
            <SearchableSelect
              id="orgao_gerador"
              options={orgaoSuggestions.length > 0 ? orgaoSuggestions : ["Secretaria de Educação", "Secretaria de Saúde", "Secretaria de Obras"]}
              value={formData.orgao_gerador}
              onChange={(value) => onInputChange("orgao_gerador", value)}
              placeholder="Digite para buscar o órgão..."
              className={getErrorClass("orgao_gerador")}
            />
            {renderError("orgao_gerador")}
          </div>
        </div>

        {/* Credor e Setor Atual lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="credor">Credor *</Label>
            <AutocompleteInput
              id="credor"
              value={formData.credor}
              onChange={(value) => onInputChange("credor", value)}
              suggestions={credorSuggestions}
              placeholder="Ex: João da Silva"
              className={getErrorClass("credor")}
            />
            {renderError("credor")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="setor_atual">Setor Atual *</Label>
            <SearchableSelect
              id="setor_atual"
              options={SETORES}
              value={formData.setor_atual}
              onChange={(value) => onInputChange("setor_atual", value)}
              placeholder="Digite para buscar o setor..."
              className={getErrorClass("setor_atual")}
            />
            {renderError("setor_atual")}
          </div>
        </div>

        {/* Campo Link do Processo */}
        <div className="space-y-2">
          <Label htmlFor="link_processo">Link do Processo</Label>
          <Input
            id="link_processo"
            type="url"
            value={formData.link_processo}
            onChange={(e) => onInputChange("link_processo", e.target.value)}
            placeholder="https://exemplo.com/processo/12345"
            className={getErrorClass("link_processo")}
          />
          {renderError("link_processo")}
          <p className="text-xs text-slate-500">
            Adicione um link para acessar o processo externamente (opcional)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => onInputChange("descricao", e.target.value)}
            placeholder="Descreva os detalhes do processo..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacao">Observação</Label>
          <Textarea
            id="observacao"
            value={formData.observacao}
            onChange={(e) => onInputChange("observacao", e.target.value)}
            placeholder="Observações adicionais..."
            rows={3}
          />
        </div>

        {/* Substituir checkbox por dropdown */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status do Processo *
          </Label>
          <Select
            value={formData.status || 'em_andamento'} // Valor padrão
            onValueChange={(value) => onInputChange("status", value)}
          >
            <SelectTrigger
              id="status"
              className={getErrorClass("status")}
            >
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    {/* Indicador visual para cada status */}
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status.value === 'concluido'
                          ? 'bg-green-500'
                          : status.value === 'cancelado'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderError("status")}
        </div>
      </CardContent>
    </Card>
  )
}