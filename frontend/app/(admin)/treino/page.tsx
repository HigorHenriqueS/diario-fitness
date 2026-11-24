"use client";

import React from "react";
import { Console } from "console";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Select from 'react-select';
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Tooltip } from "@mui/material";



const categories = [
  "Todos",
  "Peito",
  "Costas",
  "Pernas",
  "Bíceps",
  "Tríceps",
  "Ombros",
];

type Treino = {
  id: number;
  nome: string;
  grupo_muscular: string;
  imagem: string;
  descricao: string;
  observacao: string;
  series: string;
  repeticoes: string;
  pessoa_id: number;
  pessoa: {
    id: number;
    name: string;
  };
};

function bytesToBase64(bytes) {
  const uint8Array = new Uint8Array(Object.values(bytes));

  let binary = "";

  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}


export default function Treino() {
  const router = useRouter();
  const [exercicios, setTreino] = useState<Treino[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categories[0]);

  const [filtro, setFiltro] = useState({
      nome_exercicio: '',
  });

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  
  const totalPaginas = Math.ceil(exercicios.length / itensPorPagina);
  
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  
  const exerciciosPaginados = exercicios.slice(indiceInicial, indiceFinal);

  async function carregar() {
      try {
      const token = localStorage.getItem("token");

        if (!token) {
          setErro("Token não encontrado. Faça login novamente.");
          return;
        }

        const resposta = await fetch("http://localhost:3000/treino", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.message || "Erro ao carregar usuários."
          );
        }

        console.log(dados)

        setTreino(dados);
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
  
   async function Filtrar(tipo,filtro){
    const token = localStorage.getItem("token");

    let filtros = {
      tipo,filtro
    }

    console.log(filtros)

    const resposta = await fetch("http://localhost:3000/treino/filtrar_exercicio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({filtros}),
    });

    const dados = await resposta.json();

    setTreino(dados)

  }
  return (
    <div className="min-h-screen bg-white">

      {/* CONTAINER PRINCIPAL */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* CABEÇALHO DA PÁGINA */}
        <div className="mb-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-lime-400">
                Biblioteca de treinos
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Treinos
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Encontre treinos para todos os grupos musculares
                e monte seu treino ideal.
              </p>
            </div>

            {/* BOTÃO */}
            <button className="w-full rounded-xl bg-lime-400 
            px-5 py-3 text-sm font-bold text-black transition hover:bg-lime-300 
            md:w-auto"
            onClick={() => router.push("/treino/formulario_treino")}>
              + Adicionar exercício
            </button>

          </div>
        </div>

        {/* ÁREA DE BUSCA */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">

          {/* INPUT */}
          <div className="relative flex-1">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Digitar ao menos 3 letras para realizar a busca..."
              value={filtro.nome_exercicio}
              onChange={(e) => {
                const valor = e.target.value;

                setFiltro((prev) => ({
                  ...prev,
                  nome_exercicio: valor,
                }));

                if (valor.length > 3) {
                    Filtrar('nome_exercicio',valor);
                  }     
             }}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#121815] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/60"
            />

          </div>


        </div>

        {/* CATEGORIAS */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setCategoriaSelecionada(category);
                Filtrar("categoria", category);
              }}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                categoriaSelecionada === category
                  ? "bg-lime-400 text-black"
                  : "border border-white/10 bg-[#121815] text-gray-500 hover:border-lime-400/30 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* TÍTULO DOS RESULTADOS */}
        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Todos os exercícios
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {exercicios.length} exercícios disponíveis
            </p>
          </div>



        </div>

        {/* GRID DE EXERCÍCIOS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {exerciciosPaginados.map((exercicio) => (
            <ExerciseCard
              key={exercicio.id}
              exercicio={exercicio}
            />
          ))}

        </div>
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrar</span>

              <select
                value={itensPorPagina}
                onChange={(e) => {
                  setItensPorPagina(Number(e.target.value));
                  setPaginaAtual(1);
                }}
                className="rounded border border-gray-300 px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <span>registros</span>
            </div>

            <div className="flex items-center gap-1">

              <button
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(paginaAtual - 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                ←
              </button>

              {Array.from({ length: totalPaginas }, (_, index) => index + 1).map(
                (pagina) => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaAtual(pagina)}
                    className={`rounded px-3 py-1 ${
                      paginaAtual === pagina
                        ? "bg-blue-600 text-white"
                        : "border bg-white text-gray-700"
                    }`}
                  >
                    {pagina}
                  </button>
                )
              )}

              <button
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual(paginaAtual + 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                →
              </button>

            </div>

          </div> 
      </main>
    </div>
  );
}

/* =====================================================
   CARD DO EXERCÍCIO
===================================================== */

function ExerciseCard({ exercicio }) {
  const router = useRouter();
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121815] transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:shadow-2xl hover:shadow-lime-400/5">

      {/* IMAGEM */}
      <div className="relative h-52 overflow-hidden">

        <img
          src={
            exercicio.imagem
              ? `data:image/jpeg;base64,${bytesToBase64(exercicio.imagem)}`
              : "/imagem-padrao.jpg"
          }
          alt={exercicio.nome}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* GRADIENTE */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* CATEGORIA */}
        <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          {exercicio.grupo_muscular}
        </span>

      </div>

      {/* CONTEÚDO */}
      <div className="p-5">

        {/* NOME */}
        <div>
          <h3 className="text-lg font-semibold text-white">
            {exercicio.nome}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Exercício para {exercicio.grupo_muscular.toLowerCase()}
          </p>
        </div>

        {/* INFORMAÇÕES */}
        <div className="mt-5 grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-[#0c100f] p-3">
            <p className="text-xs text-gray-600">
              Séries
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-200">
              {exercicio.series}
            </p>
          </div>

          <div className="rounded-xl bg-[#0c100f] p-3">
            <p className="text-xs text-gray-600">
              Repetições
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-200">
              {exercicio.repeticoes}
            </p>
          </div>

        </div>

        {/* RODAPÉ DO CARD */}
        <div className="mt-4 flex items-center gap-2">

          <button
            type="button"
            onClick={() =>
              router.push(`/treino/formulario_treino?id=${exercicio.id}`)
            }
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-300 transition hover:border-lime-400 hover:bg-lime-400 hover:text-black"
          >
            Ver exercício
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(`/treino/formulario_treino?id=${exercicio.id}`)
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-lg font-bold text-black transition hover:bg-lime-300"
          >
            →
          </button>

        </div>

      </div>
    </article>
  );
}