"use client";

import { useEffect, useState } from "react";

type Usuario = {
  id: number;
  email: string;
  name?: string;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
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

    carregarUsuarios();
  }, []);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Carregando usuários...</p>
      </main>
    );
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
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    ID
                  </th>

                  <th className="px-4 py-3 text-left">
                    Nome
                  </th>

                  <th className="px-4 py-3 text-left">
                    E-mail
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {usuario.id}
                    </td>

                    <td className="px-4 py-3">
                      {usuario.name || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {usuario.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}