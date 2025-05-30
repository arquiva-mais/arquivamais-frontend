import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NovoProcesso } from "@/hooks/useNewProcess"

interface ValoresProcessoProps {
  formData: NovoProcesso
  onNumberChange: (field: keyof NovoProcesso, value: string) => void
  totalValue: number
}

export const ValoresProcesso: React.FC<ValoresProcessoProps> = ({
  formData,
  onNumberChange,
  totalValue
}) => {
  return (
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
              onChange={(e) => onNumberChange("valor_convenio", e.target.value)}
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
              onChange={(e) => onNumberChange("valor_recurso_proprio", e.target.value)}
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
              onChange={(e) => onNumberChange("valor_royalties", e.target.value)}
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
              }).format(totalValue)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}