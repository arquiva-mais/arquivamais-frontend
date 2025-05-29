"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Scale } from "lucide-react"
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email,
        senha: password
      })
      console.log(response)
      // Assumindo que o backend retorna um token e dados do usuário
      const { token, usuario } = response.data

      // Armazenar o token e dados do usuário
      localStorage.setItem("authToken", token)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", usuario.email)
      localStorage.setItem("userName", usuario.nome || "")
      localStorage.setItem("role", usuario.role)

      // Configurar header de autorização para próximas requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      router.push("/dashboard")
    } catch (error) {
      console.error('Erro no login:', error)

      // Tratar diferentes tipos de erro
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro na autenticação'
        alert(errorMessage) // Substitua por um toast ou componente de notificação
      } else {
        alert('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Arquiva+</h1>
          <p className="text-slate-600 mt-2">Sistema de Gestão de Processos</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">Digite suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-medium cursor-pointer" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
