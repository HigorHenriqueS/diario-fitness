"use client";

import { Console } from "console";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Select from 'react-select';

type Usuario = {
  id: number;
  email: string;
  name?: string;

};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarios_filter, setUsuariosFilter] = useState<Usuario[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalUsuario] = useState(false);
  const [dados_usuario, setUsuario] =  useState<any>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [filtro, setFiltro] = useState({
    users_filtro: [] as number[],
    email: '',
    status: '',

  });
  const usuarioOptions = usuarios_filter.map((usuario) => ({
    value: usuario.id,
    label: usuario.name,
  }));
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  const totalPaginas = Math.ceil(usuarios.length / itensPorPagina);

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;

  const usuariosPaginados = usuarios.slice(indiceInicial, indiceFinal);

    async function carregarUsuarios() {
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

        setUsuarios(dados);
        setUsuariosFilter(dados);
      } catch (error) {
        if (error instanceof Error) {
          setErro(error.message);
        } else {
          setErro("Erro ao carregar usuários.");
        }
      } finally {
        setCarregando(false);
      }
    }
  useEffect(() => {
      carregarUsuarios();
  }, []);
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Carregando usuários...</p>
      </main>
    );
  }

  async function Filtrar(filtros: object){
    const token = localStorage.getItem("token");
     const resposta = await fetch("http://localhost:3000/users/filtrar_users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({filtros}),
      });

      const dados = await resposta.json();

      setUsuarios(dados);
  }


  async function ModalUsuario(id: number | null = null, tipo: string){
    const token = localStorage.getItem("token");
    if(id !== null){

       const resposta = await fetch(`http://localhost:3000/users/getuser/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();
        dados.tipo = tipo;

        if (!resposta.ok) {
          throw new Error(
            dados.message || "Erro ao carregar usuários."
          );
        }
        setUsuario({
          ...dados,
          tipo,
          dt_nascimento: dados.dt_nascimento
            ? dados.dt_nascimento.substring(0, 10)
            : "",
        });
    }else{
      let dados = {
        tipo: tipo,
        dt_nascimento: "",
        sexo: "",
      }
      setUsuario(dados);
    }
    setModalUsuario(true);
  }

  function fecharModal() {
    setModalUsuario(false);
    setUsuario(null);
  }
  async function InativarUsuario(id: number) {
   const token = localStorage.getItem("token");

   const resposta = await fetch("http://localhost:3000/users/ativa_inativa_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({id}),
      });

     const dados = await resposta.json();
     toast.info(
        <>
          Status do usuário:{' '}
          <span style={{ color: dados === true ? 'green' : 'red' }}>
            {dados === true ? 'Ativo' : 'Inativo'}
          </span>
        </>
      );
      carregarUsuarios();
     return;

  }
  async function DeletarUsuario(id: number) {
   const token = localStorage.getItem("token");

   const resposta = await fetch("http://localhost:3000/users/deletar_usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({id}),
      });

    const dados = await resposta.json();

    if(dados == 1){
      toast.success('Usuário excluído com sucesso.')
    }else{
      toast.error('Não foi possível excluir o usuário.')
    }

     carregarUsuarios();
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

      const formData = new FormData();

      
      formData.append("id", String(dados.id));
      formData.append("name", dados.name);
      formData.append("email", dados.email);
      formData.append("password", dados.password);
      formData.append("status", String(dados.status));
      formData.append("tipo", dados.tipo);
      formData.append("sexo", dados.sexo);
      formData.append("dt_nascimento", dados.dt_nascimento);

      if (dados.imagem instanceof File) {
        formData.append("imagem", dados.imagem);
      }

      const resposta = await fetch("http://localhost:3000/users/insertorupdate", {
        method: "POST",
        headers: {
           Authorization: `Bearer ${token}`,
        },
        body: formData,
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
          Usuários
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
                        filtro.users_filtro.includes(option.value)
                      )}
                      onChange={(selected) =>
                        setFiltro((prev) => ({
                          ...prev,
                          users_filtro: selected.map((option) => option.value),
                        }))
                      }
                      placeholder="Selecione os usuários..."
                    />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-white">Email:</label>
                  <input
                    type="text"
                    value={filtro.email}
                    onChange={(e) =>
                      setFiltro((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="h-[38px] w-[185px] rounded-sm border border-[#555] bg-[#111] px-3 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-white">Status:</label>
                  <select
                   value={filtro.status}
                    onChange={(e) =>
                        setFiltro((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    className="h-[38px] w-[185px] rounded-sm border border-[#555] bg-[#111] px-3 text-sm text-white"
                  >
                    <option value="">Todos</option>
                    <option value="1">Ativos</option>
                    <option value="0">Inativos</option>
                  </select>
                </div>

                <button
                  className="h-[38px] rounded-md bg-blue-600 px-5 font-semibold text-white"
                  onClick={() => Filtrar(filtro)}>
                  Filtrar
                </button>
              </div>

            </div>

            {/* Pequeno espaço */}
            <div className="h-2 bg-[#0d281b]" />

            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
      

                  <th className="px-4 py-3 text-left">
                    Nome
                  </th>

                  <th className="px-4 py-3 text-left">
                    E-mail
                  </th>
                   <th className="px-4 py-3 text-center">
                      <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-green-700"
                      onClick={() => ModalUsuario(null,'insert')}>
                        <img
                          src="/icons/plus.svg"
                          alt="Inativar usuário"
                          className="h-5 w-5 brightness-0 invert"
                        />
                      </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuariosPaginados.map((usuario) => (
                  <tr
                    key={usuario.id}
                      className={`border-t ${usuario.status === true ? 'bg-green-100' : 'bg-red-100'}`}
                  >

                    <td className="px-4 py-3">
                      {usuario.name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {usuario.email}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      onClick={() => ModalUsuario(usuario.id,'update')}>
                        <img
                          src="/icons/square-pen.svg"
                          alt="Inativar usuário"
                          className="h-5 w-5 brightness-0 invert"
                        />
                      </button> 
                       &nbsp;
                      <button className="rounded bg-red-600 px-4 py-2 text-white hover:bg-green-700"
                      onClick={() => InativarUsuario(usuario.id)}>
                        <img
                          src="/icons/power.svg"
                          alt="Inativar usuário"
                          className="h-5 w-5 brightness-0 invert"
                        />
                      </button>
                       &nbsp;
                      <button className="rounded bg-red-600 px-4 py-2 text-white hover:bg-green-700"
                      onClick={() => DeletarUsuario(usuario.id)}>
                        <img
                          src="/icons/trash.svg"
                          alt="Inativar usuário"
                          className="h-5 w-5 brightness-0 invert"
                        />
                      </button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          </div>
        )}
      </div>
       {modalAberto && (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 z-index: 99999;">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {dados_usuario.tipo == 'update' ? "Editar usuário" : "Criar usuário"}
            </h2>

            <button
              onClick={fecharModal}
              className="text-2xl text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">
                Nome
              </label>

              <input
                type="text"
                value={dados_usuario?.name || ""}
                onChange={(e) =>
                setUsuario({
                    ...dados_usuario,
                    name: e.target.value,
                  })
                }
                className="w-full rounded border border-gray-300 p-2"
                placeholder="Nome do usuário"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">
                E-mail
              </label>

              <input
                type="email"
                value={dados_usuario?.email || ""}
                onChange={(e) =>
                setUsuario({
                    ...dados_usuario,
                    email: e.target.value,
                  })
                }
                className="w-full rounded border border-gray-300 p-2"
                placeholder="E-mail"
              />
            </div>

            <div className="relative">
              <label className="mb-1 block font-medium">
                Senha
              </label>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={dados_usuario?.password || ""}
                onChange={(e) =>
                  setUsuario({
                    ...dados_usuario,
                    password: e.target.value,
                  })
                }
                className="w-full rounded border border-gray-300 p-2 pr-10"
                placeholder="Senha"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 text-gray-500"
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="mt-6">
              <label
                htmlFor="data"
                className="mb-2 block text-sm font-medium text-gray-700" >
                Data Nascimento 
              </label>

              <input
                id="data"
                name="data"
                type="date"
                value={dados_usuario?.dt_nascimento}
                  onChange={(e) =>
                  setUsuario({
                      ...dados_usuario,
                      dt_nascimento: e.target.value,
                    })
                  }
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-full rounded border border-gray-300 p-2 pr-10"
              />
            </div>
            <div className="relative">
              <label className="mb-1 block font-medium">  
                Sexo
              </label>
                <select
                  value={dados_usuario?.status}
                  onChange={(e) =>
                  setUsuario({
                      ...dados_usuario,
                      sexo: e.target.value,
                    })
                  }
                  className="w-full rounded border border-gray-300 p-2 pr-10"
                >
                  <option value="">Selecione</option>
                  <option value="true">Masculino</option>
                  <option value="false">Feminino</option>
                </select>
            </div>
            <div>
              <label className="mb-1 block font-medium">
                Imagem
              </label>

              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];

                  if (arquivo) {
                    setUsuario({
                      ...dados_usuario,
                      imagem: arquivo,
                    });
                  }
                }}
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
            {dados_usuario.imagem && typeof dados_usuario.imagem === "string" && (
              <div className="flex justify-center">
                <img
                  src={dados_usuario.imagem}
                  alt={dados_usuario.name}
                  className="max-h-48 max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>


          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={fecharModal}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Cancelar
            </button>

            <button
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => InsertorUpdateUser(dados_usuario)}
            >
              {dados_usuario.tipo === 'update' ? "Salvar alterações" : "Criar usuário"}
            </button>
        </div>

      </div>
    </div>

      )}
    </main>
  );

}

