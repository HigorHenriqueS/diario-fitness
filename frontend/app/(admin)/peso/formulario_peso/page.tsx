"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import Select from 'react-select';
import { useSearchParams } from "next/navigation";

type Usuario = {
  id: number;
  name?: string;
};

export default function PesoForm() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fields, setFields] = useState({
    pessoa_id: [] as number[],   
    peso: '',
    altura: '',
    data: '',
    observacao: '',
  });
  
  const usuarioOptions = usuarios.map((usuario) => ({
    value: usuario.id,
    label: usuario.name,
  }));
  // =========================================================
  // CÁLCULO DO IMC
  // =========================================================

  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  console.log("ID recebido:", id);

  const pesoNumerico = Number(fields.peso);
  const alturaNumerica = Number(fields.altura);


  useEffect(() => {
  carregarUsuarios();
}, []);

  useEffect(() => {
    if (id) {
      BuscarPeso(Number(id));
    }
  }, [id]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (userId) {
      setFields((prev) => ({
        ...prev,
        pessoa_id: Number(userId),
      }));
    }
  }, []);
  
  const imc =
    pesoNumerico > 0 && alturaNumerica > 0
      ? pesoNumerico / (alturaNumerica * alturaNumerica)
      : 0;

  // =========================================================
  // CLASSIFICAÇÃO DO IMC
  // =========================================================

  const getClassificacaoIMC = () => {
    if (imc === 0) {
      return {
        texto: "",
        cor: "",
      };
    }

    if (imc < 18.5) {
      return {
        texto: "Abaixo do peso",
        cor: "text-yellow-600",
      };
    }

    if (imc < 25) {
      return {
        texto: "Peso normal",
        cor: "text-green-600",
      };
    }

    if (imc < 30) {
      return {
        texto: "Sobrepeso",
        cor: "text-orange-600",
      };
    }

    if (imc < 35) {
      return {
        texto: "Obesidade grau I",
        cor: "text-red-500",
      };
    }

    if (imc < 40) {
      return {
        texto: "Obesidade grau II",
        cor: "text-red-600",
      };
    }

    return {
      texto: "Obesidade grau III",
      cor: "text-red-700",
    };
  };

  const classificacao = getClassificacaoIMC();

  async function carregarUsuarios() {
      try {
      const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Faça login novamente para continuar.");
          return;
        }

        const resposta = await fetch("http://localhost:3000/users", {
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
        setUsuarios(dados);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar a lista de usuários.");
      } finally {
        setCarregando(false);
      }
  }

  async function BuscarPeso(id: number) {
      try {
      const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Faça login novamente para continuar.");
          return;
        }

        const resposta = await fetch(`http://localhost:3000/peso/getPeso/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();

        console.log(dados)
        if (!resposta.ok) {
          throw new Error(
            dados.message || "Erro ao carregar usuários."
          );
        }

        if (dados.data) {
          dados.data = dados.data.split("T")[0];
        }

        setFields(dados);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar o registro de peso.");
      } finally {
        setCarregando(false);
      }
  }

  async function InsertorUpdatePeso(dados: object) {
    const token = localStorage.getItem("token");

    if (!dados.pessoa_id ||!dados.peso || !dados.altura || !dados.data) {
      toast.warning("Selecione uma pessoa e informe o peso, a altura e a data.");
      return;
    }

    dados.imc = imc.toFixed(2);

  const response = await fetch(
    "http://localhost:3000/peso/formulario_peso/insertorupdate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    }
  );    

  toast.success("Registro de peso salvo com sucesso.");

  router.push("/peso");
  };

  // =========================================================
  // TELA
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-3xl">

        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/peso")}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-700"
          >
            <span className="text-lg">←</span>
            Voltar
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Registrar Peso
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Informe o peso e a altura para calcular o IMC.
          </p>
        </div>

        {/* =====================================================
            FORMULÁRIO
        ====================================================== */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            InsertorUpdatePeso(fields);
          }}
          className="rounded-xl bg-white p-6 shadow-sm md:p-8"
        >
          {/* ===================================================
              PESO E ALTURA
          ==================================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

               {/* PESSOA */}
            <div>
              <label
                htmlFor="peso"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Pessoa <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Select
                  options={usuarioOptions}
                  value={
                    usuarioOptions.find(
                      (option) => Number(option.value) === Number(fields.pessoa_id)
                    ) || null
                  }
                  onChange={(selected) =>
                    setFields((prev) => ({
                      ...prev,
                      pessoa_id: selected?.value || null,
                    }))
                  }
                  placeholder="Selecione a pessoa..."
                  isDisabled={true}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: state.isDisabled ? "#222" : "#111",
                      borderColor: state.isDisabled ? "#333" : state.isFocused ? "#666" : "#444",
                      borderRadius: "6px",
                      minHeight: "38px",
                      height: "48px",
                      boxShadow: "none",
                      opacity: state.isDisabled ? 0.6 : 1,
                      cursor: state.isDisabled ? "not-allowed" : "default",
                    }),

                    valueContainer: (base) => ({
                      ...base,
                      height: "50px",
                      padding: "0 10px",
                    }),

                    singleValue: (base, state) => ({
                      ...base,
                      color: state.isDisabled ? "#888" : "#fff",
                    }),

                    placeholder: (base) => ({
                      ...base,
                      color: "#777",
                    }),

                    input: (base) => ({
                      ...base,
                      color: "#fff",
                    }),

                    indicatorsContainer: (base) => ({
                      ...base,
                      height: "48px",
                    }),

                    dropdownIndicator: (base, state) => ({
                      ...base,
                      color: state.isDisabled ? "#555" : "#ccc",
                    }),

                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#111",
                      border: "1px solid #444",
                      zIndex: 9999,
                    }),

                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#333"
                        : state.isFocused
                        ? "#222"
                        : "#111",
                      color: "#fff",
                      cursor: "pointer",
                    }),
                  }}
                />                     
              </div>
            </div>

            {/* PESO */}
            <div>
              <label
                htmlFor="peso"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Peso <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="peso"
                  name="peso"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fields.peso}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      peso: e.target.value,
                    }))
                  }
                  placeholder="Ex.: 75.50"
                  className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full rounded-lg border border-gray-300 px-4 py-3 pr-14 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  kg
                </span>
              </div>
            </div>

            {/* ALTURA */}
            <div>
              <label
                htmlFor="altura"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Altura <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="altura"
                  name="altura"
                  type="text"
                  step="0.01"
                  min="0"
                  value={fields.altura}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      altura: e.target.value,
                    }))
                  }
                  placeholder="Ex.: 1.75"
                  className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full rounded-lg border border-gray-300 px-4 py-3 pr-14 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  m
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              RESULTADO DO IMC
          ==================================================== */}

          {imc > 0 && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Índice de Massa Corporal
                  </p>

                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-blue-800">
                      {imc.toFixed(2)}
                    </span>

                    <span className="text-sm text-gray-500">
                      kg/m²
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`text-lg font-semibold ${classificacao.cor}`}
                  >
                    {classificacao.texto}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* ===================================================
              DATA
          ==================================================== */}

          <div className="mt-6">
            <label
              htmlFor="data"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Data da medição <span className="text-red-500">*</span>
            </label>

            <input
              id="data"
              name="data"
              type="date"
              value={fields.data}
              onChange={(e) =>
                  setFields((prev) => ({
                  ...prev,
                  data: e.target.value,
                }))
              }
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* ===================================================
              OBSERVAÇÃO
          ==================================================== */}

          <div className="mt-6">
            <label
              htmlFor="observacao"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Observação
            </label>

            <textarea
              id="observacao"
              name="observacao"
              rows={4}
              value={fields.observacao}
              onChange={(e) =>
                  setFields((prev) => ({
                  ...prev,
                  observacao: e.target.value,
                }))
              }
              placeholder="Digite uma observação, se necessário..."
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* ===================================================
              SEPARADOR
          ==================================================== */}

          <div className="my-8 border-t border-gray-200" />

          {/* ===================================================
              BOTÕES
          ==================================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => router.push("/peso")}
              className="h-[38px] rounded-md bg-gray-600 px-5 font-semibold text-white">
              Cancelar
            </button>

            <button type="submit" 
            className="h-[38px] rounded-md bg-blue-600 px-5 font-semibold text-white">
                  Salvar
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}
