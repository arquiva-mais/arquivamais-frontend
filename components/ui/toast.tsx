"use client"

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './button'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onRemove: (id: string) => void
  duration?: number
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  onRemove,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const Icon = toastIcons[type]

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 50)

    // Barra de progresso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const decrement = 100 / (duration / 100)
        return Math.max(0, prev - decrement)
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [duration])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(id), 300) // Aguarda animação de saída
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${toastStyles[type]}
        min-w-[320px] max-w-[420px]
      `}
    >
      {/* Barra de progresso */}
      <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 transition-all duration-100">
        <div
          className="h-full bg-current transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />

        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-6 w-6 p-0 hover:bg-black hover:bg-opacity-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}