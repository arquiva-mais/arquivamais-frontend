import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  message = "Tem certeza que deseja excluir este item?",
  itemName
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-800"
        onClick={onClose}
      />

      <div className="relative bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-6 text-sm text-gray-700">
          <p>{message}</p>
          {itemName && (
            <p className="mt-2 font-medium text-gray-900">{`"${itemName}"`}</p>
          )}
          <p className="mt-2 text-xs text-red-500">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 hover:bg-gray-100 transition"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 bg-red-500 hover:bg-red-600 text-white transition"
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}
