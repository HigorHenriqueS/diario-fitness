export function recuperacaoSenhaTemplate(link: string) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: Arial, sans-serif;
      ">

        <div style="
          max-width: 500px;
          margin: 40px auto;
          background-color: white;
          padding: 30px;
          border-radius: 10px;
        ">

          <h1 style="
            color: #2563eb;
            text-align: center;
          ">
            Recuperação de senha
          </h1>

          <p>
            Você solicitou a recuperação da sua senha. O link expira em 30 minutos.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${link}"
              style="
                background-color: #2563eb;
                color: white;
                padding: 12px 25px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
              "
            >
              Recuperar minha senha
            </a>
          </div>

        </div>

      </body>
    </html>
  `;
}
