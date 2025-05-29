"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FileText, User, LogOut, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import axios from 'axios'

interface Processo {
  numero_processo: string
  data_entrada: string
  competencia: string
  objeto: string
  interessado: string
  orgao_gerador: string
  responsavel: string
  setor_atual: string
  descricao: string
  observacao: string
  valor_convenio: number
  valor_recurso_proprio: number
  valor_royalties: number,
  concluido: boolean
}

export default function DashboardPage() {
  const [processos, setProcessos] = useState<Processo[]>([])
  const [processoConcluido, setProcessoConcluido] = useState(0)
  const [processoEmAndamento, setProcessoEmAndamento] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("")
  const router = useRouter()
  const [isLoading, setLoading] = useState(false)

  const fetchProcessos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")

      const response = await axios.get('http://localhost:3000/processos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setProcessos(response.data)
    } catch (error) {
      console.error('Erro ao buscar processos:', error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Token inválido ou expirado
          localStorage.removeItem("authToken")
          localStorage.removeItem("isAuthenticated")
          router.push("/")
          return
        }

        const errorMessage = error.response?.data?.message || 'Erro ao carregar processos'
        alert(errorMessage) // Substitua por toast/notificação
      } else {
        alert('Erro inesperado. Tente novamente.')
      }

      // Em caso de erro, usar dados do localStorage se existirem
      const savedProcessos = localStorage.getItem("processos")
      if (savedProcessos) {
        setProcessos(JSON.parse(savedProcessos))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const email = localStorage.getItem("userEmail")
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("role") || ""
    setUserRole(role)

    if (!isAuthenticated) {
      router.push("/")
      return
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    fetchProcessos()
  }, [router])

  useEffect(() => {
    const processosConcluido = processos.filter(processo => processo.concluido).length
    setProcessoConcluido(processosConcluido)

    const processoEmAndamento = processos.filter(processo => !processo.concluido).length
    setProcessoEmAndamento(processoEmAndamento)
  }, [processos])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const filteredProcessos = processos.filter(
    (processo) =>
      processo.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.interessado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalValue = (processo: Processo) => {
    return processo.valor_convenio + processo.valor_recurso_proprio + processo.valor_royalties
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Arquiva+</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Processos</p>
                  <p className="text-3xl font-bold text-slate-900">{processos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Processos Concluídos</p>
                  <p className="text-3xl font-bold text-slate-900">{processoConcluido}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Processos Concluídos</p>
                  <p className="text-3xl font-bold text-slate-900">{processoEmAndamento}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processes Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-semibold">Processos</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar processos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                {userRole === "admin" ? (
                  <Link href="/dashboard/novo-processo">
                    <Button className="w-full sm:w-auto cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Processo
                    </Button>
                  </Link>
                ) : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Interessado</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Setor Atual</TableHead>
                    <TableHead>Data Entrada</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcessos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {searchTerm ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProcessos.map((processo, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{processo.numero_processo}</TableCell>
                        <TableCell className="max-w-xs truncate" title={processo.objeto}>
                          {processo.objeto}
                        </TableCell>
                        <TableCell>{processo.interessado}</TableCell>
                        <TableCell>{processo.responsavel}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{processo.setor_atual}</Badge>
                        </TableCell>
                        <TableCell>{new Date(processo.data_entrada).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(getTotalValue(processo))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={processo.concluido ? "default" : "secondary"}
                            className={processo.concluido ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}
                          >
                            {processo.concluido ? 'Concluído' : 'Em andamento'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
