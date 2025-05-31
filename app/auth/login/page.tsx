"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/LoginForm"
import { useNotification } from "@/hooks/useNotification"
import { ToastContainer } from "@/components/containers/toastContainer"
import { useToast } from "@/components/providers/toastProvider"

export default function LoginPage() {
  const { showNotification} = useToast()

  const handleLoginError = (error: string) => {
    showNotification(error, 'error')
  }

  return (
    <>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-center text-primary">Entrar</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Digite suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onError={handleLoginError} />
        </CardContent>
      </Card>
    </>
  )
}