"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import Select from 'react-select';
import { useSearchParams } from "next/navigation";

export default function CriarExercicio() {
  const router = useRouter();
  const [fields, setFields] = useState({
      pessoa_id: [] as number[],   
      nome: '',
      descricao: '',
      grupo_muscular: '',
      imagem: '',
      series: '',
      repeticoes: '',
      observacao: '',      
    });
  const [dados_carregados, setFields_carregado] =  useState<any>({});
  const [carregando, setCarregando] = useState(true);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log("ID recebido:", id);

  useEffect(() => {
      if (id) {
        BuscarDados(Number(id));
      }
    }, [id]);
  async function InsertorUpdateTreino(dados) {
    const token = localStorage.getItem("token");

    console.log(dados)
    const formData = new FormData();

    formData.append("id", dados.id ?? null);
    formData.append("nome", dados.nome);
    formData.append("descricao", dados.descricao);
    formData.append("grupo_muscular", dados.grupo_muscular);
    formData.append("series", dados.series);
    formData.append("repeticoes", dados.repeticoes);
    formData.append("observacao", dados.observacao);

    if (dados.imagem) {
      formData.append("imagem", dados.imagem);
    }

    try {
      const response = await fetch(
        "http://localhost:3000/treino/formulario_treino/insertorupdate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao cadastrar exercício");
      }

      toast.success("Exercício salvo com sucesso.");
      router.push("/treino");

    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar o exercício.");
    }
  }
  async function BuscarDados(id: number) {
      try {
      const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Faça login novamente para continuar.");
          return;
        }

        const resposta = await fetch(`http://localhost:3000/treino/getExercicio/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();

        if(dados.imagem){
          const uint8Array = new Uint8Array(Object.values(dados.imagem));

          let binary = "";

          uint8Array.forEach((byte) => {
            binary += String.fromCharCode(byte);
          });

          dados.imagem_tratada = binary;
        }
        console.log(dados)
        setFields(dados);
        if (!resposta.ok) {
          throw new Error(
            dados.message || "Erro ao carregar usuários."
          );
        }

        if (dados.data) {
          dados.data = dados.data.split("T")[0];
        }

        setFields_carregado(dados);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar os dados do exercício.");
      } finally {
        setCarregando(false);
      }
    }

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* CABEÇALHO */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
            Biblioteca
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Criar exercício
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Preencha as informações abaixo para cadastrar um novo exercício.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form 
        onSubmit={(e) => {
            e.preventDefault();
            InsertorUpdateTreino(fields);
          }}className="space-y-6">

          {/* INFORMAÇÕES PRINCIPAIS */}
          <div className="rounded-2xl border border-white/10 bg-[#121815] p-6 sm:p-8">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Informações do exercício
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informações básicas sobre o exercício.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Nome do exercício
                </label>

                <input
                  type="text"
                  name="nome"
                  placeholder="Ex: Supino Reto"
                  value={fields.nome}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0c100f] px-4 text-sm outline-none transition placeholder:text-gray-600 focus:border-lime-400"
                />
              </div>

              {/* GRUPO MUSCULAR */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Grupo muscular
                </label>

                <select
                  name="grupo_muscular"
                  value={fields.grupo_muscular}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      grupo_muscular: e.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0c100f] px-4 text-sm text-gray-300 outline-none focus:border-lime-400"
                >
                  <option value="">Selecione</option>
                  <option value="Peito">Peito</option>
                  <option value="Costas">Costas</option>
                  <option value="Pernas">Pernas</option>
                  <option value="Bíceps">Bíceps</option>
                  <option value="Tríceps">Tríceps</option>
                  <option value="Ombros">Ombros</option>
                  <option value="Abdômen">Abdômen</option>
                  <option value="Panturrilha">Panturrilha</option>
                </select>
              </div>


              {/* DESCRIÇÃO */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Descrição
                </label>

                <textarea
                  name="descricao"
                  rows="5"
                  placeholder="Descreva como realizar o exercício..."
                  value={fields.descricao}
                    onChange={(e) =>
                        setFields((prev) => ({
                          ...prev,
                          descricao: e.target.value,
                        }))
                      }
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0c100f] p-4 text-sm outline-none transition placeholder:text-gray-600 focus:border-lime-400"
                />
              </div>

            </div>
          </div>

          {/* CONFIGURAÇÃO DO TREINO */}
          <div className="rounded-2xl border border-white/10 bg-[#121815] p-6 sm:p-8">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Configuração
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Defina séries e repetições recomendadas.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* SÉRIES */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Séries
                </label>

                <input
                  type="number"
                  name="series"
                  min="1"
                  placeholder="Ex: 4"
                  value={fields.series}
                    onChange={(e) =>
                        setFields((prev) => ({
                          ...prev,
                          series: e.target.value,
                        }))
                      }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0c100f] px-4 text-sm outline-none transition placeholder:text-gray-600 focus:border-lime-400"
                />
              </div>

              {/* REPETIÇÕES */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Repetições
                </label>

                <input
                  type="text"
                  name="repeticoes"
                  placeholder="Ex: 10-12"
                  value={fields.repeticoes}
                    onChange={(e) =>
                        setFields((prev) => ({
                          ...prev,
                          repeticoes: e.target.value,
                        }))
                      }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0c100f] px-4 text-sm outline-none transition placeholder:text-gray-600 focus:border-lime-400"
                />
              </div>

              {/* OBSERVAÇÃO */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Observação
                </label>

                <textarea
                  name="observacao"
                  rows="4"
                  placeholder="Ex: Manter a coluna encostada no banco..."
                  value={fields.observacao}
                    onChange={(e) =>
                        setFields((prev) => ({
                          ...prev,
                          observacao: e.target.value,
                        }))
                      }
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0c100f] p-4 text-sm outline-none transition placeholder:text-gray-600 focus:border-lime-400"
                />
              </div>

            </div>
          </div>

          {/* IMAGEM */}
          <div className="rounded-2xl border border-white/10 bg-[#121815] p-6 sm:p-8">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Imagem do exercício
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Adicione uma imagem para facilitar a identificação do exercício.
              </p>
            </div>

            <label
              htmlFor="imagem"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0c100f] px-6 py-12 text-center transition hover:border-lime-400/50"
            >

              {dados_carregados.imagem ? (
                <>
                  <img
                    src={
                      dados_carregados.imagem
                        ? `data:image/jpeg;base64,${btoa(dados_carregados.imagem_tratada)}`
                        : "/imagem-padrao.jpg"
                    }
                    alt="Preview"
                    className="mb-5 h-48 w-full max-w-md rounded-xl object-cover"
                  />

                  <p className="text-sm font-medium text-white">
                    {dados_carregados.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Clique para alterar a imagem
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lime-400/10 text-2xl">
                    ↑
                  </div>

                  <p className="text-sm font-medium text-white">
                    Clique para enviar uma imagem
                  </p>

                  <p className="mt-2 text-xs text-gray-600">
                    PNG, JPG ou WEBP
                  </p>
                </>
              )}

              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];

                  if (arquivo) {
                    setFields((prev) => ({
                      ...prev,
                      imagem: arquivo,
                    }))
                  }
                }}
                className="w-full rounded border border-gray-300 p-2"
              />

            </label>
          </div>

          {/* BOTÕES */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => router.push("/treino")}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-lime-400 px-7 py-3 text-sm font-bold text-black transition hover:bg-lime-300"
            >
              Criar
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
