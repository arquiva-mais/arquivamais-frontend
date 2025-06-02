import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import api from '@/services/api'

interface LoginCredentials {
  email: string
  senha: string
}

interface User {
  email: string
  nome?: string
  role: string
}

interface LoginResponse {
  accessToken: string,
  refreshToken: string,
  user: User
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)

    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      const { accessToken, user, refreshToken } = response.data

      // Armazenar dados de autenticação
      localStorage.setItem("authToken", accessToken)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", user.email)
      localStorage.setItem("userName", user.nome || "")
      localStorage.setItem("role", user.role)
      localStorage.setItem("refreshToken", refreshToken)

      // Configurar header de autorização
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      router.push("/dashboard")
      return { success: true }
    } catch (error) {

      let errorMessage = 'Erro inesperado. Tente novamente.'

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 'Erro na autenticação'
      }

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("role")
    delete axios.defaults.headers.common['Authorization']
    router.push("/")
  }

  return { login, logout, loading }
}