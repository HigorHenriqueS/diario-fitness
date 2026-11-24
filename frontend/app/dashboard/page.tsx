export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Visão geral do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Usuários</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            3.782
          </h2>
          <p className="mt-2 text-sm text-green-500">↑ 11.01%</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Pedidos</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            5.359
          </h2>
          <p className="mt-2 text-sm text-red-500">↓ 9.05%</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Vendas</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            R$ 48.290
          </h2>
          <p className="mt-2 text-sm text-green-500">↑ 8.42%</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Pendentes</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            124
          </h2>
          <p className="mt-2 text-sm text-yellow-500">Aguardando</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Visão geral
        </h2>

        <div className="mt-6 h-64 rounded-xl bg-gray-50 dark:bg-gray-800" />
      </div>
    </div>
  );
}