'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { notificacoesApi, Notificacao } from '@/services/api'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Função para buscar notificações
  const fetchNotificacoes = useCallback(async () => {
    try {
      const data = await notificacoesApi.listar()
      setNotificacoes(data.notificacoes)
      setNaoLidas(data.naoLidas)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    }
  }, [])

  // Busca inicial e polling a cada 60 segundos
  useEffect(() => {
    fetchNotificacoes()

    const interval = setInterval(() => {
      fetchNotificacoes()
    }, 60000) // 60 segundos

    return () => clearInterval(interval)
  }, [fetchNotificacoes])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Marcar uma notificação como lida
  const handleMarcarLida = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setIsLoading(true)
    
    try {
      await notificacoesApi.marcarComoLida(id)
      
      // Atualiza o estado local
      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      )
      setNaoLidas(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Marcar todas como lidas
  const handleMarcarTodasLidas = async () => {
    setIsLoading(true)
    
    try {
      await notificacoesApi.marcarTodasComoLidas()
      
      // Atualiza o estado local
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
      setNaoLidas(0)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Formatar data relativa (ex: "há 5 min", "há 2 horas")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'agora'
    if (diffMinutes < 60) return `há ${diffMinutes} min`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays === 1) return 'ontem'
    if (diffDays < 7) return `há ${diffDays} dias`
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge de não lidas */}
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header do dropdown */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800">Notificações</h3>
            <div className="flex items-center gap-2">
              {naoLidas > 0 && (
                <button
                  onClick={handleMarcarTodasLidas}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Ler todas</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-[400px] overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notificacoes.map((notificacao) => (
                  <li
                    key={notificacao.id}
                    className={`px-4 py-3 transition-colors ${
                      notificacao.lida 
                        ? 'bg-white' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Indicador de não lida */}
                      <div className="flex-shrink-0 mt-1.5">
                        {!notificacao.lida && (
                          <span className="block w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        {notificacao.lida && (
                          <span className="block w-2 h-2" />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notificacao.lida ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                          {notificacao.mensagem}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notificacao.created_at)}
                        </p>
                      </div>

                      {/* Botão marcar como lida */}
                      {!notificacao.lida && (
                        <button
                          onClick={(e) => handleMarcarLida(notificacao.id, e)}
                          disabled={isLoading}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer informativo */}
          {notificacoes.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-400">
                Notificações são removidas automaticamente após 7 dias
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
