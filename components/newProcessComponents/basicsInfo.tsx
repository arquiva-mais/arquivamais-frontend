import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OBJETOS_PROCESSO, SETORES, MESES } from "@/utils/newProcessConsts"
import { NovoProcesso } from "@/hooks/useNewProcess"

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
  console.log('formData.competencia:', formData.competencia)
  console.log('MESES disponíveis:', MESES)
  console.log('formData.objeto:', formData.objeto)
  console.log('OBJETOS_PROCESSO disponíveis:')

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

        <div className="space-y-2">
          <Label htmlFor="objeto">Objeto *</Label>
          <Select
            value={formData.objeto}
            onValueChange={(value) => onInputChange("objeto", value)}
          >
            <SelectTrigger
              id="objeto"
              className={getErrorClass("objeto")}
            >
              <SelectValue placeholder="Selecione o objeto" />
            </SelectTrigger>
            <SelectContent>
              {OBJETOS_PROCESSO.map((objeto, index) => (
                <SelectItem key={index} value={objeto}>
                  {objeto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderError("objeto")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interessado">Interessado *</Label>
            <Input
              id="interessado"
              value={formData.interessado}
              onChange={(e) => onInputChange("interessado", e.target.value)}
              placeholder="Ex: Secretaria de Educação"
              className={getErrorClass("interessado")}
            />
            {renderError("interessado")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgao_gerador">Órgão Gerador *</Label>
            <Input
              id="orgao_gerador"
              value={formData.orgao_gerador}
              onChange={(e) => onInputChange("orgao_gerador", e.target.value)}
              placeholder="Ex: Secretaria de Educação"
              className={getErrorClass("orgao_gerador")}
            />
            {renderError("orgao_gerador")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => onInputChange("responsavel", e.target.value)}
              placeholder="Nome do responsável"
              className={getErrorClass("responsavel")}
            />
            {renderError("responsavel")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="setor_atual">Setor Atual *</Label>
            <Select
              value={formData.setor_atual}
              onValueChange={(value) => onInputChange("setor_atual", value)}
            >
              <SelectTrigger
                id="setor_atual"
                className={getErrorClass("setor_atual")}
              >
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {SETORES.map((setor, index) => (
                  <SelectItem key={index} value={setor}>
                    {setor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError("setor_atual")}
          </div>
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
      </CardContent>
    </Card>
  )
}