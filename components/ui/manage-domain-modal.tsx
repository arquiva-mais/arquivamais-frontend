"use client"

import * as React from "react"
import { Edit2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreatableSelectOption } from "./async-creatable-select"

interface ManageDomainModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  items: CreatableSelectOption[]
  onUpdate: (id: number, newNome: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onRefresh: () => Promise<void>
}

export function ManageDomainModal({
  open,
  onOpenChange,
  title,
  description,
  items,
  onUpdate,
  onDelete,
  onRefresh
}: ManageDomainModalProps) {
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editValue, setEditValue] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleStartEdit = (item: CreatableSelectOption) => {
    setEditingId(item.id)
    setEditValue(item.nome)
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue("")
    setError(null)
  }

  const handleSaveEdit = async (id: number) => {
    if (!editValue.trim()) {
      setError("O nome não pode estar vazio")
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onUpdate(id, editValue.trim())
      await onRefresh()
      setEditingId(null)
      setEditValue("")
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Erro ao atualizar";
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onDelete(id)
      await onRefresh()
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Erro ao excluir";
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item cadastrado
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent/50"
                >
                  {editingId === item.id ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(item.id)
                          } else if (e.key === "Escape") {
                            handleCancelEdit()
                          }
                        }}
                        className="flex-1"
                        autoFocus
                        disabled={loading}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={loading}
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{item.nome}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(item)}
                        disabled={loading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
