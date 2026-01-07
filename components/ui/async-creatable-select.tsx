"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CreatableSelectOption {
  id: number
  nome: string
}

interface AsyncCreatableSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  loadOptions: (search: string) => Promise<CreatableSelectOption[]>
  onCreate: (nome: string) => Promise<CreatableSelectOption>
  onManage?: () => void
  disabled?: boolean
  className?: string
  label?: string
  error?: string
}

export function AsyncCreatableSelect({
  value,
  onChange,
  placeholder = "Selecionar...",
  searchPlaceholder = "Buscar...",
  loadOptions,
  onCreate,
  onManage,
  disabled = false,
  className,
  label,
  error
}: AsyncCreatableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<CreatableSelectOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carregar opções iniciais
  React.useEffect(() => {
    if (open) {
      handleSearch("")
    }
    // Cleanup timeout on unmount or when open changes
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [open])

  const handleSearch = async (searchValue: string) => {
    setLoading(true)
    try {
      const results = await loadOptions(searchValue)
      setOptions(results)
    } catch (error) {
      console.error("Erro ao buscar opções:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!search.trim() || creating) return
    
    setCreating(true)
    try {
      const newOption = await onCreate(search.trim())
      setOptions(prev => [...prev, newOption])
      onChange(newOption.nome)
      setSearch("")
      setOpen(false)
    } catch (error) {
      console.error("Erro ao criar opção:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      handleSearch(searchValue)
    }, 500)
  }

  const selectedOption = options.find(opt => opt.nome === value)
  const hasExactMatch = options.some(opt => 
    opt.nome.toLowerCase() === search.toLowerCase()
  )
  const showCreateOption = search.trim() && !hasExactMatch && !loading

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {label}
          </label>
          {onManage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onManage}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="h-3 w-3 mr-1" />
              Gerenciar Lista
            </Button>
          )}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500"
            )}
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Carregando..." : "Nenhum resultado encontrado"}
              </CommandEmpty>
              
              {showCreateOption && (
                <CommandGroup heading="Criar novo">
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={creating}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {creating ? "Criando..." : `Criar "${search}"`}
                  </CommandItem>
                </CommandGroup>
              )}

              {options.length > 0 && (
                <CommandGroup heading={showCreateOption ? "Existentes" : undefined}>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.nome}
                      onSelect={() => {
                        onChange(option.nome)
                        setOpen(false)
                        setSearch("")
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.nome ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}
