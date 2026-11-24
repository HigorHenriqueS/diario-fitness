"use client";

import { Console } from "console";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Select from 'react-select';
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Tooltip } from "@mui/material";


type Peso = {
  id: number;
  altura: string;
  peso: string;
  imc: string;
  data: string;
  observacao: string;
  pessoa_id: number;
  pessoa: {
    id: number;
    name: string;
  };
};

type Usuario = {
  id: number;
  email: string;
  name?: string;
};

export default function UsuariosPage() {
  const [pesos, setPeso] = useState<Peso[]>([]);
  const [usuarios_filter, setUsuariosFilter] = useState<Usuario[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState({
    pessoas_filtro: [] as number[],
    data_ini: '',
    data_fim: '',
  });
  const usuarioOptions = usuarios_filter.map((usuario) => ({
    value: usuario.id,
    label: usuario.name,
  }));
  const router = useRouter();
 
  const columns: GridColDef[] =
   [
    {
      field: "nome",
      headerName: "Nome",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "peso",
      headerName: "Peso",
      width: 120,
      valueFormatter: (value) => `${value} kg`,
    },
    {
      field: "data",
      headerName: "Data",
      width: 140,
      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleDateString("pt-BR")
          : "-",
    },
    {
      field: "altura",
      headerName: "Altura",
      width: 120,
      valueFormatter: (value) => `${value} m`,
    },
    {
      field: "imc",
      headerName: "IMC",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const classificacao = getClassificacaoIMC(
          Number(params.value)
        );

        return (
          <Tooltip
            title={params.row.observacao || "Sem observação"}
            arrow
          >
            <span className={classificacao.cor}>
              {params.value} - {classificacao.texto}
            </span>
          </Tooltip>
        );
      },
    },
    {
  field: "acoes",
  headerName: "",
  width: 150,
  sortable: false,
  filterable: false,
  headerAlign: "center",
  align: "center",

  renderHeader: () => (
    <button
      className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 hover:bg-blue-700"
      onClick={() => router.push("/peso/formulario_peso")}
    >
      <img
        src="/icons/plus.svg"
        alt="Adicionar"
        className="h-5 w-5 brightness-0 invert"
      />
    </button>
  ),

  renderCell: (params) => (
    <div className="flex h-full w-full items-center justify-center gap-2">
      <button
        className="rounded bg-green-600 px-3 py-2 hover:bg-green-700"
        onClick={() =>
          router.push(`/peso/formulario_peso?id=${params.row.id}`)
        }
      >
        <img
          src="/icons/square-pen.svg"
          alt="Editar"
          className="h-5 w-5 brightness-0 invert"
        />
      </button>

      <button
        className="rounded bg-red-600 px-3 py-2 hover:bg-red-700"
        onClick={() => DeletarPeso(params.row.id)}
      >
        <img
          src="/icons/trash.svg"
          alt="Excluir"
          className="h-5 w-5 brightness-0 invert"
        />
      </button>
    </div>
  ),
},

  ];

  const rows = pesos.map((peso) => ({
    id: peso.id,
    nome: peso.pessoa?.name || "-",
    peso: peso.peso,
    data: peso.data,
    altura: peso.altura,
    imc: peso.imc,
    observacao: peso.observacao,
  }));



  async function carregar() {
    try {
    const token = localStorage.getItem("token");

      if (!token) {
        setErro("Token não encontrado. Faça login novamente.");
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

        const resposta_peso = await fetch("http://localhost:3000/peso", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados_peso = await resposta_peso.json();

      console.log(dados_peso)
      if (!resposta_peso.ok) {
        throw new Error(
          dados.message || "Erro ao carregar os pesos."
        );
      }

      setPeso(dados_peso);
      setUsuariosFilter(dados);
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

  const getClassificacaoIMC = (imc: number) => {
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


  async function Filtrar(filtros: object){
    const token = localStorage.getItem("token");
     const resposta = await fetch("http://localhost:3000/peso/filtrar_pesos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({filtros}),
      });

      const dados = await resposta.json();

      setPeso(dados);

  }


  async function DeletarPeso(id: number) {
   const token = localStorage.getItem("token");

   console.log(id)
   const resposta = await fetch("http://localhost:3000/peso/deletar_peso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({id}),
      });

    const dados = await resposta.json();

    if(dados == 1){
      toast.success('Registro de peso excluído com sucesso.')
    }else{
      toast.error('Não foi possível excluir o registro de peso.')
    }

     carregar();
     return;

  }

  async function InsertorUpdateUser(dados: object) {
    try {
    const token = localStorage.getItem("token");

      if (dados.tipo === 'insert' && !dados.password) {
        toast.error('Informe uma senha para cadastrar o usuário.')
        return;
      }

      if (dados.tipo === 'insert' && ( !dados.name || !dados.email)) {
        toast.error('Informe o nome e o e-mail para cadastrar o usuário.')
        return;
      }

      if (dados.tipo === 'update' && (!dados.name || !dados.email)) {
        toast.error('Informe o nome e o e-mail para atualizar o usuário.')
        return;
      }

      const resposta = await fetch("http://localhost:3000/users/insertorupdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json();

      if (resultado === 1) {
       toast.success('Dados do usuário salvos com sucesso.')
       fecharModal();
       await carregarUsuarios();
      }else if(resultado === 0){
       toast.error('Já existe um usuário cadastrado com este e-mail.')
      }


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
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">
          Pesos
        </h1>

        {erro && (
          <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
            {erro}
          </div>
        )}

        {!erro && (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex gap-3 bg-[#1a1a1a] p-3">
              <div className="flex items-end gap-4">
                <div className="w-full min-w-[220px]">
                  <label className="text-sm text-white">Nome:</label>
                    <Select
                      isMulti
                      options={usuarioOptions}
                      value={usuarioOptions.filter((option) =>
                        filtro.pessoas_filtro.includes(option.value)
                      )}
                      onChange={(selected) =>
                        setFiltro((prev) => ({
                          ...prev,
                          pessoas_filtro: selected.map((option) => option.value),
                        }))
                      }
                      placeholder="Selecione a pessoa..."
                    />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-white">De:</label>
                  <input
                    type="date"
                    value={filtro.data_ini}
                    onChange={(e) =>
                      setFiltro((prev) => ({
                        ...prev,
                        data_ini: e.target.value,
                      }))
                    }
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="h-[38px] w-[185px] rounded-sm border border-[#555] bg-[#111] px-3 text-sm text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-white">Até:</label>
                  <input
                    type="date"
                    value={filtro.data_fim}
                    onChange={(e) =>
                      setFiltro((prev) => ({
                        ...prev,
                        data_fim: e.target.value,
                      }))
                    }
                    className="h-[38px] w-[185px] rounded-sm border border-[#555] bg-[#111] px-3 text-sm text-white"
                  />
                </div>
                

                <button
                  className="h-[38px] rounded-md bg-blue-600 px-5 font-semibold text-white"
                  onClick={() => Filtrar(filtro)}>
                  Filtrar
                </button>
              </div>

            </div>

            {/* Pequeno espaço */}
            <div className="h-[600px] w-full">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 20, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
              disableRowSelectionOnClick
            />
          </div>



          </div>
        )}
      </div>
    </main>
  );

}

