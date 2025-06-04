"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DeleteModal } from "@/components/ui/modalDelete"
import { Loader2, Save } from "lucide-react"
import Link from "next/link"
import { ProcessoHeader } from "@/components/newProcessComponents/headerNewProcess"
import { InformacoesBasicas } from "@/components/newProcessComponents/basicsInfo"
import { ValoresProcesso } from "@/components/newProcessComponents/valueProcess"
import { useNewProcess } from "@/hooks/useNewProcess"
import { useToast } from "@/components/providers/toastProvider"

// Componente de Loading
function LoadingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando página...</p>
      </div>
    </div>
  )
}

// Componente principal com todo o código existente
function NovoProcessoPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    formData,
    loading,
    errors,
    handleInputChange,
    handleNumberChange,
    submitForm,
    getTotalValue,
    validateForm,
    editForm,
    deletProcess
  } = useNewProcess()
  const { showNotification } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletedClick, setIsDeletedClick] = useState(false)
  const isEditMode = searchParams.get('mode') === 'edit';

  const validateStatus = (status: string | null): 'em_andamento' | 'concluido' | 'cancelado' => {
    if (status === 'em_andamento' || status === 'concluido' || status === 'cancelado') {
      return status;
    }
    return 'em_andamento'; // padrão se inválido
  };

  const [editFormData, setEditFormData] = useState(() => {
    if (isEditMode) {
      return {
        id: searchParams.get('id') || '',
        numero_processo: searchParams.get('numero_processo') || '',
        data_entrada: searchParams.get('data_entrada') || '',
        competencia: searchParams.get('competencia') || '',
        objeto: searchParams.get('objeto') || '',
        interessado: searchParams.get('interessado') || '',
        orgao_gerador: searchParams.get('orgao_gerador') || '',
        responsavel: searchParams.get('responsavel') || '',
        setor_atual: searchParams.get('setor_atual') || '',
        descricao: searchParams.get('descricao') || '',
        observacao: searchParams.get('observacao') || '',
        valor_convenio: parseFloat(searchParams.get('valor_convenio') || '0'),
        valor_recurso_proprio: parseFloat(searchParams.get('valor_recurso_proprio') || '0'),
        valor_royalties: parseFloat(searchParams.get('valor_royalties') || '0'),
        status: validateStatus(searchParams.get('status')),
      };
    }

    return {
      id: '',
      numero_processo: '',
      data_entrada: '',
      competencia: '',
      objeto: '',
      interessado: '',
      orgao_gerador: '',
      responsavel: '',
      setor_atual: '',
      descricao: '',
      observacao: '',
      valor_convenio: 0,
      valor_recurso_proprio: 0,
      valor_royalties: 0,
      status: 'em_andamento' as const,
    };
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
      return
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!isEditMode && !validateForm()) {
      setIsLoading(false)
      return
    }

    if (isEditMode) {
      editForm(
        editFormData,
        Number(editFormData.id),
        () => {
          showNotification("Processo editado com sucesso!", 'success')
          setIsLoading(false)
        },
        (error) => {
          showNotification(error, 'error')
          setIsLoading(false)
        }
      )
    } else {
      submitForm(
        () => {
          showNotification("Processo criado com sucesso!", 'success')
          setIsLoading(false)
        },
        (error) => {
          showNotification(error, 'error')
          setIsLoading(false)
        }
      )
    }
  }

  const handleLoading = () => {
    setIsLoading(true)
  }

  const handleDelete = () => {
    setIsDeletedClick(true)
  }

  const handleCloseModal = () => {
    setIsDeletedClick(false)
  }

  const handleConfirmDelete = () => {
    console.log('Excluindo processo:', editFormData.id)
    deletProcess(Number(editFormData.id))
    showNotification("Processo excluído com sucesso!", 'success')
    setIsDeletedClick(false)
  }

  const handleEditInputChange = (field: string, value: string | number | boolean) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditNumberChange = (field: string, value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value);
    handleEditInputChange(field, isNaN(numericValue) ? 0 : numericValue);
  };

  const getEditTotalValue = () => {
    return (editFormData.valor_convenio || 0) +
      (editFormData.valor_recurso_proprio || 0) +
      (editFormData.valor_royalties || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ProcessoHeader isEditMode={isEditMode} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isEditMode ? (
            <InformacoesBasicas
              formData={editFormData}
              errors={errors}
              onInputChange={handleEditInputChange}
              isLoading={isLoading}
              onStopLoading={() => setIsLoading(false)}
              isEditMode={true}
            />
          ) : (
            <InformacoesBasicas
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              isLoading={isLoading}
              onStopLoading={() => setIsLoading(false)}
              isEditMode={false}
            />
          )}

          {isEditMode ? (
            <ValoresProcesso
              formData={editFormData}
              onNumberChange={handleEditNumberChange}
              totalValue={getEditTotalValue()}
            />
          ) : (
            <ValoresProcesso
              formData={formData}
              onNumberChange={handleNumberChange}
              totalValue={getTotalValue()}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto cursor-pointer">
                Cancelar
              </Button>
            </Link>
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="w-full sm:w-auto cursor-pointer bg-red-500 text-white hover:bg-red-800 duration-500">
                  Excluir
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  onClick={handleLoading}
                  className="w-full sm:w-auto cursor-pointer">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Editando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Editar Processo
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                onClick={handleLoading}
                className="w-full sm:w-auto cursor-pointer">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Processo
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </main>

      <DeleteModal
        isOpen={isDeletedClick}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Processo"
        message="Tem certeza que deseja excluir este processo?"
        itemName={`${editFormData.numero_processo} - ${editFormData.objeto}`}
      />
    </div>
  )
}

// Página principal exportada com Suspense
export default function NovoProcessoPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <NovoProcessoPageContent />
    </Suspense>
  )
}