"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useNotification } from '@/hooks/useNotification'
import { ToastContainer } from '@/components/containers/toastContainer'

interface ToastContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { toasts, showNotification, removeToast, clearAllToasts } = useNotification()

  return (
    <ToastContext.Provider value={{ showNotification, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}