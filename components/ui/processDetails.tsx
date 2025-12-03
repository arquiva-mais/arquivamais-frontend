import { Badge } from "@/components/ui/badge"


interface Processo {
   id?: number,
   numero_processo: string
   data_entrada: string
   competencia: string
   objeto: string
   credor: string
   interessado?: string  // Mantém para compatibilidade
   orgao_gerador: string
   responsavel: string
   setor_atual: string
   link_processo?: string
   descricao: string
   observacao: string
   valor_convenio: number
   valor_recurso_proprio: number
   valor_royalties: number
   status: 'em_andamento' | 'concluido' | 'cancelado'
   nome?: string
   update_for?: string
   createdAt?: string
   data_atualizacao?: string
}

interface ProcessDetailsProps {
   processo: Processo
   isExpanded: boolean
}

export const ProcessDetails: React.FC<ProcessDetailsProps> = ({ processo, isExpanded }) => {
   const formatDateLocal = (dateString: string) => {
      if (!dateString) return '...';

      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      return date.toLocaleDateString('pt-BR');
   };

   const formatDateTime = (dateString: string) => {
      if (!dateString) return '...';

      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };
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
      <div
         className={`
        overflow-hidden transition-all duration-1000 ease-in-out
        ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
      `}
      >
         <div className="p-4 bg-gray-50 border-t transform transition-transform duration-300 ease-in-out">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="space-y-3 animate-fadeIn">
                  <h4 className="font-semibold text-gray-800 border-b pb-1">Informações Básicas</h4>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Número:</span>
                     <p className="text-sm">{processo.numero_processo}</p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Data de Entrada:</span>
                     <p className="text-sm">{formatDateLocal(processo.data_entrada.split('T')[0])}</p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Competência:</span>
                     <p className="text-sm">{processo.competencia}</p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Órgão Gerador:</span>
                     <p className="text-sm">{processo.orgao_gerador}</p>
                  </div>
               </div>

               <div className="space-y-3 animate-fadeIn animation-delay-100">
                  <h4 className="font-semibold text-gray-800 border-b pb-1">Responsabilidades</h4>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Credor:</span>
                     <p className="text-sm max-w-sm truncate" title={processo.credor || processo.interessado}>
                        {processo.credor || processo.interessado}
                     </p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Responsável:</span>
                     <p className="text-sm">{processo.responsavel}</p>
                  </div>
                  {processo.link_processo && (
                     <div>
                        <span className="text-sm font-medium text-gray-600">Link do Processo:</span>
                        <a
                           href={processo.link_processo}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-sm text-blue-600 hover:text-blue-800 hover:underline block truncate max-w-sm"
                           title={processo.link_processo}
                        >
                           Acessar processo
                        </a>
                     </div>
                  )}
                  <div>
                     <span className="text-sm font-medium text-gray-600">Setor Atual:</span>
                     <Badge variant="outline" className="text-xs">{processo.setor_atual}</Badge>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Status:</span>
                     <br />
                     <Badge
                        variant={processo.status ? "default" : "secondary"}
                        className={`text-xs ${processo.status === 'concluido' ? "bg-green-100 text-green-800" : (processo.status == 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}
                     >
                        {processo.status === 'concluido'
                           ? 'Concluído'
                           : processo.status === 'em_andamento'
                              ? 'Em andamento'
                              : 'Cancelado'
                        }
                     </Badge>
                  </div>
               </div>

               <div className="space-y-3 animate-fadeIn animation-delay-200">
                  <h4 className="font-semibold text-gray-800 border-b pb-1">Valores Financeiros</h4>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Valor Convênio:</span>
                     <p className="text-sm font-medium text-blue-600">{formatCurrency(processo.valor_convenio)}</p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Recurso Próprio:</span>
                     <p className="text-sm font-medium text-green-600">{formatCurrency(processo.valor_recurso_proprio)}</p>
                  </div>
                  <div>
                     <span className="text-sm font-medium text-gray-600">Royalties:</span>
                     <p className="text-sm font-medium text-purple-600">{formatCurrency(processo.valor_royalties)}</p>
                  </div>
                  <div className="pt-2 border-t">
                     <span className="text-sm font-medium text-gray-600">Valor Total:</span>
                     <p className="text-lg font-bold text-gray-800">{formatCurrency(getTotalValue(processo))}</p>
                  </div>
               </div>

               <div className="space-y-3 animate-fadeIn animation-delay-250">
                  <h4 className="font-semibold text-gray-800 border-b pb-1">Histórico</h4>

                  {processo.responsavel && (
                     <div>
                        <span className="text-sm font-medium text-gray-600">Criado por:</span>
                        <p className="text-sm font-medium text-blue-700">{processo.responsavel}</p>
                        {processo.createdAt && (
                           <p className="text-xs text-gray-500">{formatDateTime(processo.createdAt)}</p>
                        )}
                     </div>
                  )}

                  {processo.update_for && (
                     <div className="pt-2">
                        <span className="text-sm font-medium text-gray-600">Última alteração:</span>
                        <p className="text-sm font-medium text-green-700">{processo.update_for}</p>
                        {processo.data_atualizacao && (
                           <p className="text-xs text-gray-500">{formatDateTime(processo.data_atualizacao)}</p>
                        )}
                     </div>
                  )}

                  {!processo.responsavel && !processo.update_for && (
                     <div className="flex items-center justify-center h-20">
                        <p className="text-sm text-gray-400 italic">Sem informações de histórico</p>
                     </div>
                  )}
               </div>

               {(processo.descricao || processo.observacao) && (
                  <div className="col-span-full space-y-3 animate-fadeIn animation-delay-300">
                     <h4 className="font-semibold text-gray-800 border-b pb-1">Descrição e Observações</h4>
                     {processo.descricao && (
                        <div>
                           <span className="text-sm font-medium text-gray-600">Descrição:</span>
                           <div className="text-sm mt-1 p-2 bg-white rounded border max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                              {processo.descricao}
                           </div>
                        </div>
                     )}
                     {processo.observacao && (
                        <div>
                           <span className="text-sm font-medium text-gray-600">Observação:</span>
                           <div className="text-sm mt-1 p-2 bg-white rounded border max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                              {processo.observacao}
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}
