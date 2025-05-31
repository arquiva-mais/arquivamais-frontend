import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

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
  token: string
  usuario: User
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)

    try {
      const response = await axios.post<LoginResponse>('http://localhost:3000/auth/login', credentials)
      const { token, usuario } = response.data

      // Armazenar dados de autenticação
      localStorage.setItem("authToken", token)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", usuario.email)
      localStorage.setItem("userName", usuario.nome || "")
      localStorage.setItem("role", usuario.role)

      // Configurar header de autorização
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

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