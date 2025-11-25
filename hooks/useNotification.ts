import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export const useNotification = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showNotification = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 9)

    const newToast: Toast = {
      id,
      message,
      type,
      duration
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove após o tempo especificado
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showNotification,
    removeToast,
    clearAllToasts
  }
}