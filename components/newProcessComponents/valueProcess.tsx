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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 space-y-2">
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
          <div className="flex-1 space-y-2">
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
          <div className="flex-1 space-y-2">
            <Label htmlFor="outros_valores">Outros Valores</Label>
            <Input
              id="outros_valores"
              type="number"
              step="0.01"
              value={formData.outros_valores === 0 ? "" : formData.outros_valores}
              onChange={(e) => onNumberChange("outros_valores", e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex-1 bg-slate-50 p-4 rounded-lg">
          <div className="flex justify-between items-center bg-black p-2 rounded-2xl text-white">
            <span className="font-medium">Valor Total:</span>
            <span className="text-xl font-bold text-slate-900 text-white">
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