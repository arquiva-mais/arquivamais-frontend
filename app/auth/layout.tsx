import { VscNewFolder } from "react-icons/vsc";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
              <VscNewFolder className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Arquiva+</h1>
          </div>
          <p className="text-slate-600 mt-2">Sistema de Gestão de Processos</p>
        </div>

        {children}
      </div>
    </div>
  )
}