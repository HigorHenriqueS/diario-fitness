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

type Alimento = {
  id: number;
  nome?: string;
  calorias: string;
};

type Cardapio = {
  id: number;
  data?: string;
};

export default function CalendarioPage() {
  const hoje = new Date();

  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [erro, setErro] = useState("");
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEscolher, setModalEscolher] = useState(false);
  const [modalVerEditar, setModalVerEditar] = useState(false);
  const [verRefeicoes, setverRefeicoes] = useState(false);
  const [refeicoesSalvas, setRefeicoesSalvas] = useState([]);
  const [refeicaoAberta, setRefeicaoAberta] = useState(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fields, setFields] = useState({
    pessoa_id: [] as number[],  
    refeicao_id: null,
    alimentos: [
      {
        alimento_id: [] as number[], 
        quantidade: "",
        calorias: "",
      },
    ],    
    data: '',
    observacao: '',
    last_peso: '',
  });


  const usuarioOptions = usuarios.map((usuario) => ({
    value: usuario.id,
    label: usuario.name,
  }));

  const alimentoOptions = alimentos.map((alimento) => ({
    value: alimento.id,
    label: alimento.nome,
  }));

 const refeicaoOptions = [
    { value: 1, label: "Café da manhã" },
    { value: 2, label: "Almoço" },
    { value: 3, label: "Lanche" },
    { value: 4, label: "Janta" },
  ];


  const adicionarAlimento = () => {
    setFields((prev) => ({
      ...prev,
      alimentos: [
        ...prev.alimentos,
        {
          alimento_id: null,
          quantidade: "",
          calorias: "",
        },
      ],
    }));
  };

  const alterarAlimento = (
    index: number,
    campo: "alimento_id" | "peso",
    valor: number | string | null
  ) => {
    setFields((prev) => ({
      ...prev,
      alimentos: prev.alimentos.map((item, i) => {
        if (i !== index) {
          return item;
        }

        // Quando troca o alimento
        if (campo === "alimento_id") {
          const alimentoSelecionado = alimentos.find(
            (alimento) => alimento.id === Number(valor)
          );

          const peso = Number(item.peso || 0);

          const caloriasPor100g = Number(
            alimentoSelecionado?.calorias || 0
          );

          const caloriasCalculadas =
            peso > 0
              ? (caloriasPor100g * peso) / 100
              : 0;

          return {
            ...item,
            alimento_id: valor,
            calorias:
              peso > 0
                ? caloriasCalculadas.toFixed(2)
                : "",
          };
        }

        // Quando troca o peso
        if (campo === "peso") {
          const alimentoSelecionado = alimentos.find(
            (alimento) =>
              alimento.id === Number(item.alimento_id)
          );

          const caloriasPor100g = Number(
            alimentoSelecionado?.calorias || 0
          );

          const peso = Number(valor || 0);

          const caloriasCalculadas =
            (caloriasPor100g * peso) / 100;

          return {
            ...item,
            peso: valor,
            calorias:
              peso > 0
                ? caloriasCalculadas.toFixed(2)
                : "",
          };
        }

        return item;
      }),
    }));
  };


  const removerAlimento = (index) => {
    setFields((prev) => ({
      ...prev,
      alimentos: prev.alimentos.filter((_, i) => i !== index),
    }));
  };

  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Primeiro dia do mês
  // 0 = Domingo
  // 1 = Segunda
  // ...
  // 6 = Sábado
  const primeiroDia = new Date(ano, mes, 1).getDay();

  // Quantidade de dias do mês
  const quantidadeDias = new Date(
    ano,
    mes + 1,
    0,
  ).getDate();

  const dias: (number | null)[] = [];

  // Espaços antes do primeiro dia
  for (let i = 0; i < primeiroDia; i++) {
    dias.push(null);
  }

  // Dias do mês
  for (let dia = 1; dia <= quantidadeDias; dia++) {
    dias.push(dia);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
      const userId = localStorage.getItem("user_id");

      if (userId) {
        setFields((prev) => ({
          ...prev,
          pessoa_id: Number(userId),
        }));
      }
    }, []);

  function mesAnterior() {
    if (mes === 0) {
      setMes(11);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  }

  function proximoMes() {
    if (mes === 11) {
      setMes(0);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  }

  const refeicoesAgrupadas = refeicoesSalvas.reduce((acc, item) => {
  const refeicao = item.refeicao;

    if (!acc[refeicao]) {
      acc[refeicao] = [];
    }

    acc[refeicao].push(item);

    return acc;
  }, {});

  function toggleRefeicao(id) {
    setRefeicaoAberta((prev) =>
      prev === id ? null : id
    );
  }


  async function carregarDados() {
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

        const resposta_alimentos = await fetch("http://localhost:3000/alimentos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados_alimentos = await resposta_alimentos.json();

        if (!resposta_alimentos.ok) {
          throw new Error(
            dados.message || "Erro ao carregar usuários."
          );
        }
        setAlimentos(dados_alimentos);

         const resposta_cardapios = await fetch("http://localhost:3000/cardapios", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados_cardapios = await resposta_cardapios.json();

        console.log(dados_cardapios)
        if (!resposta_cardapios.ok) {
          throw new Error(
            dados.message || "Erro ao carregar usuários."
          );
        }

        setCardapios(dados_cardapios);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar os dados do cardápio.");
      } finally {
        setCarregando(false);
      }
  }

  async function ModalEscolher(dia,mes,ano){
    setFields((prev) => ({
      ...prev,
      data: `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
    }));
  
    setModalEscolher(true);
  }

  async function ModalCriar(){
    const user_id = localStorage.getItem("user_id");

    await get_peso_pessoa(user_id);

    setModalCriar(true);
  }

  async function ModalVerEditar(){
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");
    if (!token || !user_id) {
      toast.error("Faça login novamente para continuar.");
      return;
    }


    const resposta = await fetch(`http://localhost:3000/cardapios/getRefeicoes/${user_id}/${fields.data}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const resultado = await resposta.json();

    await get_peso_pessoa(user_id);

    if(resultado.length > 0){
      setModalVerEditar(true);
      setRefeicoesSalvas(resultado);
    }else{
      toast.warning('Nenhuma refeição cadastrada para a seleção atual.')
    }
  }

  function alterarRefeicaoSalva(
  id: number,
  campo: "alimento_id" | "peso_alimento" | "calorias_alimento",
  valor: number | string | null
) {
  setRefeicoesSalvas((prev) =>
    prev.map((item) => {
      if (item.id !== id) {
        return item;
      }

      // Alterando o alimento
      if (campo === "alimento_id") {
        const alimentoSelecionado = alimentos.find(
          (alimento) => alimento.id === Number(valor)
        );

        const peso = Number(item.peso_alimento || 0);

        const caloriasPor100g = Number(
          alimentoSelecionado?.calorias || 0
        );

        const caloriasCalculadas =
          peso > 0
            ? (caloriasPor100g * peso) / 100
            : 0;

        return {
          ...item,
          alimento_id: valor,
          calorias_alimento:
            peso > 0
              ? caloriasCalculadas.toFixed(2)
              : "",
        };
      }

      // Alterando o peso
      if (campo === "peso_alimento") {
        const alimentoSelecionado = alimentos.find(
          (alimento) =>
            alimento.id === Number(item.alimento_id)
        );

        const caloriasPor100g = Number(
          alimentoSelecionado?.calorias || 0
        );

        const peso = Number(valor || 0);

        const caloriasCalculadas =
          (caloriasPor100g * peso) / 100;

        return {
          ...item,
          peso_alimento: valor,
          calorias_alimento:
            peso > 0
              ? caloriasCalculadas.toFixed(2)
              : "",
        };
      }

      // Alterando manualmente as calorias
      if (campo === "calorias_alimento") {
        return {
          ...item,
          calorias_alimento: valor,
        };
      }

      return item;
    })
  );
}


  function fecharModal() {
    setModalCriar(false);
    setModalVerEditar(false);
    setModalEscolher(false);

  }

  async function get_peso_pessoa(pessoa_id) {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Faça login novamente para continuar.");
      return;
    }

    const resposta = await fetch(`http://localhost:3000/peso/getLastPesoUser/${pessoa_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.message || "Erro ao carregar os pesos."
      );
    }

    setFields((prev) => ({
      ...prev,
      last_peso: dados.tmb
    }));

  }

  async function InsertorUpdateCardapio(dados) {
    try {
      const token = localStorage.getItem("token");

      if (!dados.pessoa_id || !dados.refeicao) {
        toast.error('Selecione uma pessoa e uma refeição para salvar o cardápio.')
        return;
      }
      const resposta = await fetch("http://localhost:3000/cardapios/insertorupdate", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json();

      await fecharModal()
      setFields((prev) => ({
          refeicao_id: null,
          alimentos: [
            {
              alimento_id: [] as number[], 
              quantidade: "",
              calorias: "",
            },
          ],    
          data: '',
          observacao: '',
          last_peso: '',
        }))
       toast.success('Cardápio salvo com sucesso.')
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao realizar login.");
      }
    } finally {
      setCarregando(false);
    }
  }


  async function DeletarRefeicao(refeicao) {
    const token = localStorage.getItem("token");
    
      let refeicao_id = refeicao.id
      const resposta = await fetch("http://localhost:3000/cardapios/deletar_refeicao", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({refeicao_id}),
        });
  
      const dados = await resposta.json();
  
      if(dados == 1){
        toast.success('Cardápio excluído com sucesso.')
      }else{
        toast.error('Não foi possível excluir o cardápio.')
      }
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Cabeçalho */}
        <h1 className="mb-6 text-3xl font-bold">
          Cardápios
        </h1>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={mesAnterior}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            ←
          </button>

          <h1 className="text-2xl font-bold">
            {meses[mes]} {ano}
          </h1>

          <button
            onClick={proximoMes}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            →
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7">
          {[
            "Dom",
            "Seg",
            "Ter",
            "Qua",
            "Qui",
            "Sex",
            "Sáb",
          ].map((dia) => (
            <div
              key={dia}
              className="border-b p-3 text-center text-sm font-medium text-gray-500"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-7">
          {dias.map((dia, index) => {
            const ehHoje =
              dia === diaAtual &&
              mes === mesAtual &&
              ano === anoAtual;

            const dataDoDia = dia
              ? `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
              : "";

            const temCardapio = dia
              ? cardapios.some((cardapio) => {
                  if (!cardapio.data) return false;

                  return cardapio.data.slice(0, 10) === dataDoDia;
                })
              : false;

            return (
              <button
                key={index}
                onClick={() => ModalEscolher(dia,mes+1,ano)}
                disabled={dia === null}
                className={`
                  min-h-28 border-b border-r p-3 text-left transition
                  ${
                    !dia
                          ? "cursor-default bg-gray-50"
                          : ehHoje
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white hover:bg-blue-50"
                      }
                    `}
                  >
                
                {dia && (
                    <div className="relative h-full w-full">

                                        {/* Ícone de comida */}
                                        

                                        {/* Número do dia */}
                                        <span
                        className={`
                          flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                          ${
                            ehHoje
                              ? "bg-white text-blue-600"
                              : ""
                          }
                        `}
                      >
                        {dia}
                      </span>

                      {temCardapio && (
                        <img
                          src="/icons/utensils.svg"
                          alt="Cardápio cadastrado"
                          className={`
                            absolute right-0 top-0
                            h-5 w-5
                            ${ehHoje ? "brightness-0 invert" : ""}
                          `}
                        />
                      )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
       {modalEscolher && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">

            {/* Cabeçalho */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                O que deseja fazer?
              </h2>

              <button
                type="button"
                onClick={() => fecharModal()}
                className="text-2xl text-gray-400 transition hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* CRIAR */}
              <button
                type="button"
                onClick={() => {
                  setModalEscolher(false);
                  ModalCriar();
                }}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-600
                  px-5
                  py-4
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                Criar Cardapio
              </button>

              {/* EDITAR */}
              <button
                type="button"
                onClick={() => {
                  setModalEscolher(false);
                  ModalVerEditar()
                }}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  bg-yellow-500
                  px-5
                  py-4
                  font-semibold
                  text-white
                  transition
                  hover:bg-yellow-600
                "
              >
                Ver/Editar Cardapios
              </button>

            </div>

            {/* Cancelar */}
            <button
              type="button"
              onClick={() => fecharModal()}
              className="
                mt-4
                w-full
                rounded-lg
                bg-gray-100
                px-4
                py-3
                text-gray-700
                transition
                hover:bg-gray-200
              "
            >
              Cancelar
            </button>

          </div>
        </div>
      )}

      {modalCriar && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div
            className="
              relative
              flex
              max-h-[95vh]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-xl
              bg-white
              shadow-2xl
            "
          >
            {/* ===================================================== */}
            {/* CABEÇALHO */}
            {/* ===================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                Montar Cardápio
              </h2>

              <button
                type="button"
                onClick={fecharModal}
                className="
                  text-2xl
                  font-light
                  text-gray-500
                  transition
                  hover:text-gray-800
                "
              >
                ×
              </button>
            </div>

            {/* ===================================================== */}
            {/* CONTEÚDO */}
            {/* ===================================================== */}

            <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">

              {/* =================================================== */}
              {/* PESSOA + REFEIÇÃO */}
              {/* =================================================== */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* ================= PESSOA ================= */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pessoa <span className="text-red-500">*</span>
                  </label>

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

                {/* ================= REFEIÇÃO ================= */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Refeição <span className="text-red-500">*</span>
                  </label>

                  <Select
                    options={refeicaoOptions}
                    value={
                      refeicaoOptions.find(
                        (option) => option.value === fields.refeicao
                      ) || null
                    }
                    onChange={(selected) =>
                      setFields((prev) => ({
                        ...prev,
                        refeicao: selected?.value ?? null,
                      }))
                    }
                    placeholder="Selecione a refeição..."
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "#111",
                        borderColor: state.isFocused ? "#666" : "#444",
                        borderRadius: "6px",
                        minHeight: "48px",
                        boxShadow: "none",
                      }),

                      valueContainer: (base) => ({
                        ...base,
                        padding: "0 10px",
                      }),

                      input: (base) => ({
                        ...base,
                        color: "#fff",
                      }),

                      singleValue: (base) => ({
                        ...base,
                        color: "#fff",
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: "#777",
                      }),

                      indicatorsContainer: (base) => ({
                        ...base,
                        height: "48px",
                      }),

                      dropdownIndicator: (base) => ({
                        ...base,
                        color: "#ccc",
                        "&:hover": {
                          color: "#fff",
                        },
                      }),

                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 100000,
                      }),

                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#111",
                        border: "1px solid #444",
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

              {/* =================================================== */}
              {/* ALIMENTOS */}
              {/* =================================================== */}

              <div className="mt-7">

                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">
                    Alimentos
                  </h3>

                  <span
                    className={`text-sm font-medium ${
                      fields.alimentos.reduce(
                        (total, item) => total + Number(item.calorias || 0),
                        0
                      ) < Number(fields.last_peso)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {fields.alimentos.length}{" "}
                    {fields.alimentos.length === 1
                      ? "alimento"
                      : "alimentos"}{" "}
                    |{" "}
                    {fields.alimentos
                      .reduce(
                        (total, item) => total + Number(item.calorias || 0),
                        0
                      )
                      .toFixed(0)}{" "}
                    kcal{" "}
                    |{" "}
                    {fields.last_peso} kcal
                  </span>
                </div>

                {/* Cabeçalho da tabela */}
              <div className="mb-2 hidden grid-cols-[1fr_140px_140px_48px] gap-3 px-1 sm:grid">
                <span className="text-sm font-medium text-gray-600">
                  Alimento
                </span>

                <span className="text-sm font-medium text-gray-600">
                  Peso (g)
                </span>

                <span className="text-sm font-medium text-gray-600">
                  Calorias
                </span>

                <span />
              </div>

                {/* Lista */}
                <div className="space-y-3">

                  {fields.alimentos.map((item, index) => (
                    <div
                      key={index}
                      className="
                        grid
                        grid-cols-1
                        gap-3
                        rounded-lg
                        border
                        border-gray-200
                        bg-gray-50
                        p-3
                        sm:grid-cols-[1fr_140px_140px_48px]
                        sm:border-0
                        sm:bg-transparent
                        sm:p-0
                      "
                    >

                      {/* ================= ALIMENTO ================= */}

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                          Alimento
                        </label>

                        <Select
                          options={alimentoOptions}
                          value={
                            alimentoOptions.find(
                              (option) =>
                                option.value === item.alimento_id
                            ) || null
                          }
                          onChange={(selected) =>
                            alterarAlimento(
                              index,
                              "alimento_id",
                              selected?.value ?? null
                            )
                          }
                          placeholder="Selecione o alimento..."
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              backgroundColor: "#111",
                              borderColor: state.isFocused
                                ? "#666"
                                : "#444",
                              borderRadius: "6px",
                              minHeight: "48px",
                              boxShadow: "none",
                            }),

                            valueContainer: (base) => ({
                              ...base,
                              padding: "0 10px",
                            }),

                            input: (base) => ({
                              ...base,
                              color: "#fff",
                            }),

                            singleValue: (base) => ({
                              ...base,
                              color: "#fff",
                            }),

                            placeholder: (base) => ({
                              ...base,
                              color: "#777",
                            }),

                            indicatorsContainer: (base) => ({
                              ...base,
                              height: "48px",
                            }),

                            dropdownIndicator: (base) => ({
                              ...base,
                              color: "#ccc",
                              "&:hover": {
                                color: "#fff",
                              },
                            }),

                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 100000,
                            }),

                            menu: (base) => ({
                              ...base,
                              backgroundColor: "#111",
                              border: "1px solid #444",
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

                      {/* ================= PESO ================= */}

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                          Peso (g)
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.peso}
                          onChange={(e) =>
                            alterarAlimento(
                              index,
                              "peso",
                              e.target.value
                            )
                          }
                          placeholder="Peso em g"
                          className="
                            h-12
                            w-full
                            rounded-md
                            border
                            border-gray-400
                            bg-[#111]
                            px-3
                            text-white
                            outline-none
                            placeholder:text-gray-600
                            focus:border-blue-500
                          "
                        />
                      </div>
                      {/* ================= CALORIAS ================= */}

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                          Calorias
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.calorias}
                          onChange={(e) =>
                            alterarAlimento(
                              index,
                              "calorias",
                              e.target.value
                            )
                          }
                          placeholder="kcal"
                          className="
                            h-12
                            w-full
                            rounded-md
                            border
                            border-gray-400
                            bg-[#111]
                            px-3
                            text-white
                            outline-none
                            placeholder:text-gray-600
                            focus:border-blue-500
                          "
                        />
                      </div>

                      {/* ================= BOTÃO ================= */}

                      <div className="flex items-end">
                        {index === fields.alimentos.length - 1 ? (
                          <button
                            type="button"
                            onClick={adicionarAlimento}
                            title="Adicionar alimento"
                            className="
                              flex
                              h-12
                              w-full
                              items-center
                              justify-center
                              rounded-md
                              bg-blue-600
                              text-2xl
                              font-bold
                              text-white
                              transition
                              hover:bg-blue-700
                              sm:w-12
                            "
                          >
                            +
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removerAlimento(index)}
                            title="Remover alimento"
                            className="
                              flex
                              h-12
                              w-full
                              items-center
                              justify-center
                              rounded-md
                              bg-red-600
                              text-xl
                              font-bold
                              text-white
                              transition
                              hover:bg-red-700
                              sm:w-12
                            "
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* RODAPÉ */}
            {/* ===================================================== */}

            <div
              className="
                flex
                shrink-0
                flex-col-reverse
                gap-3
                border-t
                bg-gray-50
                px-4
                py-4
                sm:flex-row
                sm:justify-end
                sm:px-6
              "
            >
              <button
                type="button"
                onClick={fecharModal}
                className="
                  w-full
                  rounded-md
                  bg-gray-200
                  px-4
                  py-2
                  text-gray-700
                  transition
                  hover:bg-gray-300
                  sm:w-auto
                "
              >
                Cancelar
              </button>

              {verRefeicoes && (
                <button
                  type="button"
                  onClick={() => InsertorUpdateCardapio(fields)}
                  className="
                    w-full
                    rounded-md
                    bg-blue-600
                    px-4
                    py-2
                    text-white
                    transition
                    hover:bg-blue-700
                    sm:w-auto
                  "
                >
                  Ver Refeições
                </button>
              )}

              <button
                type="button"
                onClick={() => InsertorUpdateCardapio(fields)}
                className="
                  w-full
                  rounded-md
                  bg-blue-600
                  px-4
                  py-2
                  text-white
                  transition
                  hover:bg-blue-700
                  sm:w-auto
                "
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVerEditar && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-2 sm:p-4">

          <div
            className="
              relative
              flex
              max-h-[95vh]
              w-full
              max-w-5xl
              flex-col
              overflow-hidden
              rounded-xl
              bg-white
              shadow-2xl
            "
          >

            {/* ===================================================== */}
            {/* CABEÇALHO */}
            {/* ===================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">

              <div>
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  Refeições
                   <div
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    refeicoesSalvas.reduce(
                      (total, item) =>
                        total + Number(item.calorias_alimento || 0),
                      0
                    ) < Number(fields.last_peso || 0)
                      ? "bg-green-50"
                      : "bg-red-50"
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      refeicoesSalvas.reduce(
                        (total, item) =>
                          total + Number(item.calorias_alimento || 0),
                        0
                      ) < Number(fields.last_peso || 0)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {refeicoesSalvas
                      .reduce(
                        (total, item) =>
                          total + Number(item.calorias_alimento || 0),
                        0
                      )
                      .toFixed(0)}{" "}
                    kcal
                  </span>

                  <span className="mx-1 text-gray-400">
                    /
                  </span>

                  <span className="text-gray-500">
                    {Number(fields.last_peso || 0).toFixed(0)} kcal
                  </span>
                </div>
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Visualize e edite as refeições salvas
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalVerEditar(false)}
                className="
                  text-2xl
                  font-light
                  text-gray-500
                  transition
                  hover:text-gray-800
                "
              >
                ×
              </button>

            </div>


            {/* ===================================================== */}
            {/* CONTEÚDO */}
            {/* ===================================================== */}

            <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">

              <div className="space-y-3">

                {refeicaoOptions.map((refeicao) => {

                  /*
                  * Pega somente os alimentos dessa refeição
                  */
                  const alimentos = refeicoesSalvas.filter(
                    (item) =>
                      Number(item.refeicao) === Number(refeicao.value)
                  );

                  /*
                  * Se não existir essa refeição salva,
                  * não mostra no accordion.
                  */
                  if (alimentos.length === 0) {
                    return null;
                  }

                  const aberta =
                    refeicaoAberta === refeicao.value;

                  const totalCalorias = alimentos.reduce(
                    (total, item) =>
                      total + Number(item.calorias_alimento || 0),
                    0
                  );

                  const totalPeso = alimentos.reduce(
                    (total, item) =>
                      total + Number(item.peso_alimento || 0),
                    0
                  );

                  return (
                    <div
                      key={refeicao.value}
                      className="
                        overflow-hidden
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                      "
                    >

                      {/* ================================================= */}
                      {/* CABEÇALHO DO ACCORDION */}
                      {/* ================================================= */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleRefeicao(refeicao.value)
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          bg-gray-50
                          px-4
                          py-4
                          text-left
                          transition
                          hover:bg-gray-100
                        "
                      >

                        <div className="flex items-center gap-3">

                          {/* Ícone */}
                          
                          
                          <div>

                            <h3 className="font-bold text-gray-800">
                              {refeicao.label}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {alimentos.length}{" "}
                              {alimentos.length === 1
                                ? "alimento"
                                : "alimentos"}
                              {" • "}
                              {totalPeso}g
                              {" • "}

                              <span
                                className={`font-semibold ${
                                  totalCalorias < Number(fields.last_peso || 0)
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {totalCalorias.toFixed(0)} kcal
                                {" / "}
                                {Number(fields.last_peso || 0).toFixed(0)} kcal
                              </span>
                            </p>


                          </div>

                        </div>


                        {/* SETA */}

                        <span
                          className={`
                            text-xl
                            text-gray-500
                            transition-transform
                            duration-200
                            ${
                              aberta
                                ? "rotate-180"
                                : ""
                            }
                          `}
                        >
                          ▼
                        </span>

                      </button>


                      {/* ================================================= */}
                      {/* CONTEÚDO */}
                      {/* ================================================= */}

                      {aberta && (
                        <div className="border-t border-gray-200">

                          {/* Cabeçalho */}

                          <div
                            className="
                              hidden
                              grid-cols-[1fr_140px_140px_100px]
                              gap-3
                              bg-white
                              px-4
                              py-3
                              sm:grid
                            "
                          >

                            <span className="text-sm font-medium text-gray-500">
                              Alimento
                            </span>

                            <span className="text-sm font-medium text-gray-500">
                              Peso (g)
                            </span>

                            <span className="text-sm font-medium text-gray-500">
                              Calorias
                            </span>

                            <span />

                          </div>


                          {/* Alimentos */}

                          <div className="divide-y">

                            {alimentos.map((item, index) => {

                              const alimento =
                                alimentoOptions.find(
                                  (option) =>
                                    Number(option.value) ===
                                    Number(item.alimento_id)
                                );

                              return (
                                <div
                                  key={item.id || index}
                                  className="
                                    grid
                                    grid-cols-1
                                    gap-3
                                    px-4
                                    py-4
                                    sm:grid-cols-[1fr_140px_140px_100px]
                                    sm:items-center
                                  "
                                >

                                  {/* ============================ */}
                                  {/* ALIMENTO */}
                                  {/* ============================ */}

                                  <div>

                                    <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                                      Alimento
                                    </label>
                            
                                    <Select
                                       options={alimentoOptions}
                                        value={
                                          alimentoOptions.find(
                                            (option) =>
                                              option.value === item.alimento_id
                                          ) || null
                                        }
                                        onChange={(selected) =>
                                          alterarRefeicaoSalva(
                                            item.id,
                                            "alimento_id",
                                            selected?.value ?? null
                                          )
                                        }
                                        placeholder="Selecione a refeição..."
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                          control: (base, state) => ({
                                            ...base,
                                            backgroundColor: "#111",
                                            borderColor: state.isFocused ? "#666" : "#444",
                                            borderRadius: "6px",
                                            minHeight: "48px",
                                            boxShadow: "none",
                                          }),

                                          valueContainer: (base) => ({
                                            ...base,
                                            padding: "0 10px",
                                          }),

                                          input: (base) => ({
                                            ...base,
                                            color: "#fff",
                                          }),

                                          singleValue: (base) => ({
                                            ...base,
                                            color: "#fff",
                                          }),

                                          placeholder: (base) => ({
                                            ...base,
                                            color: "#777",
                                          }),

                                          indicatorsContainer: (base) => ({
                                            ...base,
                                            height: "48px",
                                          }),

                                          dropdownIndicator: (base) => ({
                                            ...base,
                                            color: "#ccc",
                                            "&:hover": {
                                              color: "#fff",
                                            },
                                          }),

                                          menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 100000,
                                          }),

                                          menu: (base) => ({
                                            ...base,
                                            backgroundColor: "#111",
                                            border: "1px solid #444",
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


                                  {/* ============================ */}
                                  {/* PESO */}
                                  {/* ============================ */}

                                  <div>

                                    <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                                      Peso (g)
                                    </label>

                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={item.peso_alimento ?? ""}
                                      onChange={(e) =>
                                        alterarRefeicaoSalva(
                                          item.id,
                                          "peso_alimento",
                                          e.target.value
                                        )
                                      }
                                      className="
                                        h-12
                                        w-full
                                        rounded-md
                                        border
                                        border-gray-400
                                        bg-[#111]
                                        px-3
                                        text-white
                                        outline-none
                                        focus:border-blue-500
                                      "
                                    />

                                  </div>


                                  {/* ============================ */}
                                  {/* CALORIAS */}
                                  {/* ============================ */}

                                  <div>

                                    <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">
                                      Calorias
                                    </label>

                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={item.calorias_alimento ?? ""}
                                      onChange={(e) =>
                                        alterarRefeicaoSalva(
                                          item.id,
                                          "peso_alimento",
                                          e.target.value
                                        )
                                      }
                                      className="
                                        h-12
                                        w-full
                                        rounded-md
                                        border
                                        border-gray-400
                                        bg-[#111]
                                        px-3
                                        text-white
                                        outline-none
                                        focus:border-blue-500
                                      "
                                    />

                                  </div>


                                  {/* ============================ */}
                                  {/* EDITAR */}
                                  {/* ============================ */}

                                    <div className="flex h-full w-full items-center justify-center gap-2">

                                     <button
                                        className="rounded bg-green-600 px-3 py-2 hover:bg-green-700"
                                        onClick={() => InsertorUpdateCardapio(item)}
                                      >
                                        <img
                                          src="/icons/check-circle.svg"
                                          alt="Editar"
                                          className="h-5 w-5 brightness-0 invert"
                                        />
                                      </button>

                                    <button
                                      className="rounded bg-red-600 px-3 py-2 hover:bg-red-700"
                                      onClick={() => DeletarRefeicao(item)}
                                    >
                                      <img
                                        src="../icons/trash.svg"
                                        alt="Excluir"
                                        className="h-5 w-5 brightness-0 invert"
                                      />
                                    </button>

                                  </div>

                                </div>
                              );

                            })}

                          </div>


                          {/* ================================================= */}
                          {/* RODAPÉ DA REFEIÇÃO */}
                          {/* ================================================= */}

                          <div
                            className="
                              flex
                              flex-col
                              gap-3
                              border-t
                              bg-gray-50
                              px-4
                              py-4
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                            "
                          >

                            <div className="text-sm text-gray-600">

                              <span className="font-medium">
                                Total:
                              </span>

                              {" "}

                              {totalPeso}g
                              {" • "}
                              {totalCalorias.toFixed(0)} kcal

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                InsertorUpdateCardapio({
                                  refeicao: refeicao.value,
                                  alimentos: alimentos,
                                  acao:'editar'
                                })
                              }
                              className="
                                rounded-md
                                bg-blue-600
                                px-5
                                py-2
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                              "
                            >
                              Salvar
                            </button>

                          </div>

                        </div>
                      )}

                    </div>
                    
                     
                  );

                })}

              </div>

            </div>

            {/* ===================================================== */}
            {/* RODAPÉ DO MODAL */}
            {/* ===================================================== */}

            <div
              className="
                flex
                shrink-0
                justify-end
                border-t
                bg-gray-50
                px-4
                py-4
                sm:px-6
              "
            >

              <button
                type="button"
                onClick={() => setModalVerEditar(false)}
                className="
                  w-full
                  rounded-md
                  bg-gray-200
                  px-5
                  py-2
                  text-gray-700
                  transition
                  hover:bg-gray-300
                  sm:w-auto
                "
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}




    </main>
  );
}
