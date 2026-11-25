"use client";
import { Console } from "console";
import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 32000 },
  { month: "Fev", revenue: 41000 },
  { month: "Mar", revenue: 38000 },
  { month: "Abr", revenue: 52000 },
  { month: "Mai", revenue: 61000 },
  { month: "Jun", revenue: 58000 },
  { month: "Jul", revenue: 72000 },
  { month: "Ago", revenue: 85000 },
  { month: "Set", revenue: 78000 },
  { month: "Out", revenue: 92000 },
  { month: "Nov", revenue: 105000 },
  { month: "Dez", revenue: 128000 },
];


const salesData = [
  { category: "Eletrônicos", sales: 420 },
  { category: "Roupas", sales: 310 },
  { category: "Casa", sales: 280 },
  { category: "Esportes", sales: 190 },
  { category: "Livros", sales: 140 },
];

const statusData = [
  { name: "Concluídas", value: 68 },
  { name: "Pendentes", value: 20 },
  { name: "Canceladas", value: 12 },
];

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

const stats = [
  {
    title: "Faturamento",
    value: "R$ 128.450",
    change: "+12,5%",
    description: "vs. mês anterior",
    icon: "R$",
    iconBg: "bg-blue-100 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Vendas",
    value: "1.284",
    change: "+8,2%",
    description: "vs. mês anterior",
    icon: "↗",
    iconBg: "bg-green-100 dark:bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    title: "Clientes",
    value: "892",
    change: "+15,3%",
    description: "vs. mês anterior",
    icon: "♙",
    iconBg: "bg-purple-100 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Ticket médio",
    value: "R$ 100,04",
    change: "+4,3%",
    description: "vs. mês anterior",
    icon: "$",
    iconBg: "bg-orange-100 dark:bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
  
  type Peso = {
  id: number;
  peso: string;
  imc: string;
  data: string;

};
export default function Dashboard() {
  const [pesos, setPeso] = useState<Peso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
     const token = localStorage.getItem("token");

      const resposta = await fetch("http://localhost:3000/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
           "Authorization": `Bearer ${token}`,
        }
      });

      const dados_user = await resposta.json();
      localStorage.setItem("user_id",dados_user.id);
      console.log(dados_user)

      if (!resposta.ok) {
        throw new Error(
          dados_user.message || "Erro ao carregar usuário."
        );
      }

      const resposta_peso = await fetch(`http://localhost:3000/peso/getPesobyUser/${dados_user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados_peso = await resposta_peso.json();

      const dados = dados_peso.map((item) => ({
        data: new Date(item.data).toLocaleDateString("pt-BR"),
        peso: Number(item.peso),
      }));
      console.log(dados)

      if (!resposta_peso.ok) {
        throw new Error(
          dados.message || "Erro ao carregar os pesos."
        );
      }

      setPeso(dados);
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao carregar.");
      }
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
      carregar();
  }, []);
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Carregando os pesos...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Bem-vindo ao seu painel. Aqui está um resumo do seu negócio.
          </p>
        </div>

        <button
          className="
            rounded-lg border border-gray-200 bg-white px-4 py-2.5
            text-sm font-medium text-gray-700 shadow-sm
            transition hover:bg-gray-50
            dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200
            dark:hover:bg-gray-800
          "
        >
          Últimos 12 meses
        </button>
      </div>

      {/* Stats
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="
              rounded-xl border border-gray-200 bg-white p-5 shadow-sm
              dark:border-gray-800 dark:bg-gray-900
            "
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <span className="text-sm font-bold">{stat.icon}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stat.change}
                </span>

                <span className="text-gray-400">
                  {stat.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Charts - primeira linha */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue */}
        <div
          className="
            rounded-xl border border-gray-200 bg-white p-5 shadow-sm
            xl:col-span-2
            dark:border-gray-800 dark:bg-gray-900
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Peso
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Evolução do peso
            </p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={pesos}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="data"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  unit=" kg"
                />

                <Tooltip
                  formatter={(value) => [`${value} kg`, "Peso"]}
                />

                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#2563eb",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status
        <div
          className="
            rounded-xl border border-gray-200 bg-white p-5 shadow-sm
            dark:border-gray-800 dark:bg-gray-900
          "
        >
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status das vendas
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Distribuição dos pedidos
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [`${value}%`, "Pedidos"]}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      {/* Charts - segunda linha
      <div className="mt-6">
        <div
          className="
            rounded-xl border border-gray-200 bg-white p-5 shadow-sm
            dark:border-gray-800 dark:bg-gray-900
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vendas por categoria
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Quantidade de vendas por categoria de produto
            </p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />

                <Tooltip
                  cursor={{ fill: "rgba(37, 99, 235, 0.05)" }}
                  formatter={(value) => [value, "Vendas"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <Bar
                  dataKey="sales"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div> */}
    </div>
  );
}
