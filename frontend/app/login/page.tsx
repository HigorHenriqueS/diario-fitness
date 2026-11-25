"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [modalEsqueciSenha, setModalEsqueciSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [fields, setFields] = useState({
    email: '',  
  });
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const resposta = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        email,
        password: senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message || "E-mail ou senha inválidos."
        );
      }


      localStorage.setItem("token", dados.access_token);

      router.push("/");
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

  async function RecuperarSenha(fields: { email: string }) {
    try {
      const resposta = await fetch("http://localhost:3000/users/verificar_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: fields.email }),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível solicitar a recuperação. Tente novamente.");
      }

      const dados = await resposta.json();
      toast.success(dados.message);
      setModalEsqueciSenha(false);
    } catch {
      toast.error("Não foi possível solicitar a recuperação. Tente novamente.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-1 block text-sm font-medium"
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
              placeholder="Sua senha"
              required
            />
          </div>

          {erro && (
            <p className="rounded bg-red-100 p-3 text-sm text-red-700">
              {erro}
            </p>
          )}

          <button type="button"  onClick={() => setModalEsqueciSenha(true)}>
            Esqueci a senha
          </button>
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {modalEsqueciSenha && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalEsqueciSenha(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Esqueci minha senha
              </h2>

              <button
                type="button"
                onClick={() => setModalEsqueciSenha(false)}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Digite seu e-mail para receber um link de recuperação de senha.
            </p>

            <form onSubmit={(e) => {
                e.preventDefault();
                RecuperarSenha(fields);
              }}>
              <div>
                <label
                  htmlFor="emailRecuperacao"
                  className="mb-1 block text-sm font-medium"
                >
                  E-mail
                </label>

                <input
                  id="emailRecuperacao"
                  type="email"
                  value={fields.email}
                  onChange={(e) =>
                      setFields({
                      ...fields,
                      email: e.target.value,
                    })
                  }
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded border border-gray-300 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <br></br>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalEsqueciSenha(false)}
                  className="w-1/2 rounded border border-gray-300 p-2 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-1/2 rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700"
                >
                  Enviar link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>

    
  );
}
