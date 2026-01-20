import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AsyncCreatableSelect } from "@/components/ui/async-creatable-select"
import { ManageDomainModal } from "@/components/ui/manage-domain-modal"
import { MESES } from "@/utils/newProcessConsts"
import { NovoProcesso } from "@/hooks/useNewProcess"
import { useDomainManager } from "@/hooks/useDomainManager"
import { AlertCircle, Edit, Lock } from "lucide-react"

const STATUS_OPTIONS = [
  { value: 'em_andamento', label: 'Em andamento', color: 'bg-yellow-500' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' }
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
  const { 
    domains, 
    modals, 
    toggleModal, 
    loadDomain, 
    createItem, 
    updateItem, 
    deleteItem 
  } = useDomainManager()

  const [isManualDate, setIsManualDate] = useState(false)

  useEffect(() => {
    // Attempt auto-fill date on mount or update if not manual and empty/mismatched
    if (!isManualDate && formData.numero_processo) {
      const match = formData.numero_processo.trim().match(/^(\d{4})\.(\d{2})(\d{2})/)
      if (match) {
        const [_, year, day, month] = match
        if (parseInt(month) >= 1 && parseInt(month) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
          const newDate = `${year}-${month}-${day}`
          if (formData.data_criacao_docgo !== newDate) {
            onInputChange("data_criacao_docgo", newDate)
          }
        }
      } else if (!formData.numero_processo.trim() && formData.data_criacao_docgo) {
        // Clear date if number is empty (and not just whitespace)
         onInputChange("data_criacao_docgo", "")
      }
    }
  }, [formData.numero_processo, isManualDate, onInputChange, formData.data_criacao_docgo])

  const handleNumeroProcessoChange = (value: string) => {
    onInputChange("numero_processo", value)
  }

  useEffect(() => {
    loadDomain('objeto')
    loadDomain('credor')
    loadDomain('orgao')
    loadDomain('setor')
  }, [loadDomain])

  const renderError = (field: string) => {
    if (isEditMode || !errors[field] || isLoading) return null
    
    onStopLoading()
    return (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {errors[field]}
      </p>
    )
  }

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
              onChange={(e) => handleNumeroProcessoChange(e.target.value)}
              placeholder="2025.12345678912.PG.PMP"
              className={`bg-slate-50 ${getErrorClass("numero_processo")}`}
            />
            {renderError("numero_processo")}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="data_criacao_docgo">Data de Criação (DocGO)</Label>
            <button
              type="button"
              onClick={() => setIsManualDate(!isManualDate)}
              className="absolute top-0 right-0 text-gray-500 hover:text-blue-600 transition-colors p-0.5"
              title={isManualDate ? "Bloquear edição automática" : "Editar data manualmente"}
            >
              {isManualDate ? <Lock className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
            </button>
            <Input
              id="data_criacao_docgo"
              type="date"
              value={formData.data_criacao_docgo || ""}
              onChange={(e) => onInputChange("data_criacao_docgo", e.target.value)}
              disabled={!isManualDate}
              className={!isManualDate ? "bg-slate-100 cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competencia">Competência</Label>
            <Select
              value={formData.competencia}
              onValueChange={(value) => onInputChange("competencia", value === "clear" ? "" : value)}
            >
              <SelectTrigger
                id="competencia"
                className={getErrorClass("competencia")}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear" className="text-slate-500 italic">
                  Limpar seleção
                </SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <AsyncCreatableSelect
              label="Objeto *"
              value={formData.objeto}
              onChange={(value) => onInputChange("objeto", value)}
              placeholder="Selecione ou crie um objeto"
              searchPlaceholder="Buscar objeto..."
              loadOptions={(search) => loadDomain('objeto', search)}
              onCreate={(nome) => createItem('objeto', nome)}
              onManage={() => toggleModal('objeto', true)}
              error={!isEditMode && errors.objeto ? errors.objeto : undefined}
            />
          </div>

          <div className="space-y-2">
            <AsyncCreatableSelect
              label="Órgão Gerador *"
              value={formData.orgao_gerador}
              onChange={(value) => onInputChange("orgao_gerador", value)}
              placeholder="Selecione ou crie um órgão"
              searchPlaceholder="Buscar órgão..."
              loadOptions={(search) => loadDomain('orgao', search)}
              onCreate={(nome) => createItem('orgao', nome)}
              onManage={() => toggleModal('orgao', true)}
              error={!isEditMode && errors.orgao_gerador ? errors.orgao_gerador : undefined}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <AsyncCreatableSelect
              label="Credor *"
              value={formData.credor}
              onChange={(value) => onInputChange("credor", value)}
              placeholder="Selecione ou crie um credor"
              searchPlaceholder="Buscar credor..."
              loadOptions={(search) => loadDomain('credor', search)}
              onCreate={(nome) => createItem('credor', nome)}
              onManage={() => toggleModal('credor', true)}
              error={!isEditMode && errors.credor ? errors.credor : undefined}
            />
          </div>

          <div className="space-y-2">
            <AsyncCreatableSelect
              label="Setor Atual *"
              value={formData.setor_atual}
              onChange={(value) => onInputChange("setor_atual", value)}
              placeholder="Selecione ou crie um setor"
              searchPlaceholder="Buscar setor..."
              loadOptions={(search) => loadDomain('setor', search)}
              onCreate={(nome) => createItem('setor', nome)}
              onManage={() => toggleModal('setor', true)}
              error={!isEditMode && errors.setor_atual ? errors.setor_atual : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_entrada">Data da Última Tramitação *</Label>
            <Input
              id="data_entrada"
              type="date"
              value={formData.data_entrada}
              onChange={(e) => onInputChange("data_entrada", e.target.value)}
              className={getErrorClass("data_entrada")}
            />
            {renderError("data_entrada")}
            <p className="text-[11px] text-slate-500">
              Define o início da contagem de dias neste setor.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_processo">Link do Processo *</Label>
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
            Adicione um link para acessar o processo externamente
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

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status do Processo *
          </Label>
          <Select
            value={formData.status || 'em_andamento'}
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
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderError("status")}
        </div>

        <ManageDomainModal
          open={modals.objeto}
          onOpenChange={(open) => toggleModal('objeto', open)}
          title="Gerenciar Objetos"
          description="Renomeie ou exclua objetos cadastrados"
          items={domains.objeto.items}
          onUpdate={(id, nome) => updateItem('objeto', id, nome)}
          onDelete={(id) => deleteItem('objeto', id)}
          onRefresh={async () => { await loadDomain('objeto') }}
        />

        <ManageDomainModal
          open={modals.credor}
          onOpenChange={(open) => toggleModal('credor', open)}
          title="Gerenciar Credores"
          description="Renomeie ou exclua credores cadastrados"
          items={domains.credor.items}
          onUpdate={(id, nome) => updateItem('credor', id, nome)}
          onDelete={(id) => deleteItem('credor', id)}
          onRefresh={async () => { await loadDomain('credor') }}
        />

        <ManageDomainModal
          open={modals.orgao}
          onOpenChange={(open) => toggleModal('orgao', open)}
          title="Gerenciar Órgãos Geradores"
          description="Renomeie ou exclua órgãos geradores cadastrados"
          items={domains.orgao.items}
          onUpdate={(id, nome) => updateItem('orgao', id, nome)}
          onDelete={(id) => deleteItem('orgao', id)}
          onRefresh={async () => { await loadDomain('orgao') }}
        />

        <ManageDomainModal
          open={modals.setor}
          onOpenChange={(open) => toggleModal('setor', open)}
          title="Gerenciar Setores"
          description="Renomeie ou exclua setores cadastrados"
          items={domains.setor.items}
          onUpdate={(id, nome) => updateItem('setor', id, nome)}
          onDelete={(id) => deleteItem('setor', id)}
          onRefresh={async () => { await loadDomain('setor') }}
        />
      </CardContent>
    </Card>
  )
}