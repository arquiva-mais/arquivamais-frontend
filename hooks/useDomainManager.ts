import { useState, useCallback } from "react"
import { CreatableSelectOption } from "@/components/ui/async-creatable-select"
import { objetosApi, credoresApi, orgaosGeradoresApi, setoresApi } from "@/services/api"
import { useToast } from "@/components/providers/toastProvider"

type DomainType = 'objeto' | 'credor' | 'orgao' | 'setor'

interface DomainState {
  items: CreatableSelectOption[]
  isLoading: boolean
}

export const useDomainManager = () => {
  const { showNotification } = useToast()
  
  const [domains, setDomains] = useState<Record<DomainType, DomainState>>({
    objeto: { items: [], isLoading: false },
    credor: { items: [], isLoading: false },
    orgao: { items: [], isLoading: false },
    setor: { items: [], isLoading: false }
  })

  const [modals, setModals] = useState<Record<DomainType, boolean>>({
    objeto: false,
    credor: false,
    orgao: false,
    setor: false
  })

  const toggleModal = useCallback((type: DomainType, open: boolean) => {
    setModals(prev => ({ ...prev, [type]: open }))
  }, [])

  const loadDomain = useCallback(async (type: DomainType, search: string = "") => {
    setDomains(prev => ({ ...prev, [type]: { ...prev[type], isLoading: true } }))
    try {
      let data: CreatableSelectOption[] = []
      switch (type) {
        case 'objeto':
          data = await objetosApi.listar(search)
          break
        case 'credor':
          data = await credoresApi.listar(search)
          break
        case 'orgao':
          data = await orgaosGeradoresApi.listar(search)
          break
        case 'setor':
          data = await setoresApi.listar(search)
          break
      }
      setDomains(prev => ({ ...prev, [type]: { items: data, isLoading: false } }))
      return data
    } catch (error) {
      console.error(`Error loading ${type}:`, error)
      showNotification(`Erro ao carregar ${type}s`, 'error')
      setDomains(prev => ({ ...prev, [type]: { ...prev[type], isLoading: false } }))
      return []
    }
  }, [showNotification])

  const createItem = useCallback(async (type: DomainType, nome: string) => {
    try {
      let novo
      switch (type) {
        case 'objeto':
          novo = await objetosApi.criar(nome)
          break
        case 'credor':
          novo = await credoresApi.criar(nome)
          break
        case 'orgao':
          novo = await orgaosGeradoresApi.criar(nome)
          break
        case 'setor':
          novo = await setoresApi.criar(nome)
          break
      }
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} criado com sucesso`, 'success')
      await loadDomain(type)
      return novo
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      showNotification(`Erro ao criar ${type}`, 'error')
      throw error
    }
  }, [loadDomain, showNotification])

  const updateItem = useCallback(async (type: DomainType, id: number, nome: string) => {
    try {
      switch (type) {
        case 'objeto':
          await objetosApi.renomear(id, nome)
          break
        case 'credor':
          await credoresApi.renomear(id, nome)
          break
        case 'orgao':
          await orgaosGeradoresApi.renomear(id, nome)
          break
        case 'setor':
          await setoresApi.renomear(id, nome)
          break
      }
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} atualizado com sucesso`, 'success')
      await loadDomain(type)
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
      throw error
    }
  }, [loadDomain, showNotification])

  const deleteItem = useCallback(async (type: DomainType, id: number) => {
    try {
      switch (type) {
        case 'objeto':
          await objetosApi.excluir(id)
          break
        case 'credor':
          await credoresApi.excluir(id)
          break
        case 'orgao':
          await orgaosGeradoresApi.excluir(id)
          break
        case 'setor':
          await setoresApi.excluir(id)
          break
      }
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} excluído com sucesso`, 'success')
      await loadDomain(type)
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      throw error
    }
  }, [loadDomain, showNotification])

  return {
    domains,
    modals,
    toggleModal,
    loadDomain,
    createItem,
    updateItem,
    deleteItem
  }
}
