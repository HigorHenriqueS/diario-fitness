"use client";

import { FormEvent, use, useState } from "react";
import Link from "next/link";

export default function ResetarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = use(searchParams);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);

  async function handleResetarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (senha !== confirmacao) {
      setErro("As senhas precisam ser iguais.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch("http://localhost:3000/users/resetar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password: senha }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.message || "Erro ao redefinir a senha.");
      }

      setSenhaAlterada(true);
      setSenha("");
      setConfirmacao("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao redefinir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-gray-900 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Redefinir senha</h1>

        {senhaAlterada ? (
          <p role="status" className="rounded bg-green-100 p-3 text-sm text-green-800">
            Senha alterada com sucesso. Entre com sua nova senha.
          </p>
        ) : typeof token !== "string" || !token ? (
          <p className="rounded bg-red-100 p-3 text-sm text-red-700">
            Link de recuperação inválido. Solicite outro na tela de login.
          </p>
        ) : (
          <form onSubmit={handleResetarSenha} className="space-y-4">
            <div>
              <label htmlFor="senha" className="mb-1 block text-sm font-medium">
                Nova senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={8}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
              <p className="mt-1 text-sm text-gray-600">Use pelo menos 8 caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirmacao" className="mb-1 block text-sm font-medium">
                Confirme a nova senha
              </label>
              <input
                id="confirmacao"
                type="password"
                autoComplete="new-password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>

            {erro && (
              <p role="alert" className="rounded bg-red-100 p-3 text-sm text-red-700">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {carregando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-5 block text-center text-sm text-blue-700 hover:underline">
          Voltar ao login
        </Link>
      </div>
    </main>
  );
}
