# Estudo

Aplicação web para acompanhar treinos, evolução de peso e alimentação. O painel reúne o cadastro de usuários, exercícios, registros de peso com cálculo de IMC e cardápios por refeição.

## Tecnologias

| Parte do projeto | Tecnologias |
| --- | --- |
| Interface | Next.js, React, TypeScript, Tailwind CSS e Material UI |
| API | NestJS, TypeScript e autenticação JWT |
| Banco de dados | MariaDB com Prisma |

## Executar localmente

### 1. Instalar as dependências

Use Node.js 22.12 ou superior na linha 22, ou Node.js 24, além do npm e de um servidor MariaDB.

Na raiz do projeto, execute os três comandos. Algumas dependências compartilhadas ficam declaradas no `package.json` da raiz.

```bash
npm ci
npm --prefix backend ci
npm --prefix frontend ci
```

### 2. Configurar o banco e a autenticação

Crie um banco local chamado `estudo` no MariaDB. Use [`backend/.env.example`](backend/.env.example) como modelo para criar `backend/.env` e substitua os valores de exemplo. Se a senha do banco tiver caracteres reservados de URL, codifique-os no valor de `DATABASE_URL`.

```dotenv
DATABASE_URL="mysql://usuario:senha@localhost:3306/estudo"
JWT_SECRET="substitua-por-um-segredo-aleatorio"
```

A API, o Prisma CLI e o [script de importação de alimentos](backend/prisma/seed.ts) usam a mesma variável `DATABASE_URL`.

Na pasta `backend/`, prepare o banco e gere o cliente Prisma:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Iniciar a API e o frontend

Abra dois terminais na raiz do projeto.

**Terminal 1 — API**

```bash
npm --prefix backend run start:dev
```

**Terminal 2 — Frontend**

```bash
npm --prefix frontend run dev -- --port 3001
```

Acesse o [login](http://localhost:3001/login). Na configuração atual, o frontend chama a API em `http://localhost:3000`, e a API aceita requisições da interface em `http://localhost:3001`.

### 4. Criar a primeira conta

O cadastro pelo painel exige autenticação. Se o banco estiver vazio, crie primeiro um usuário ativo no banco local com nome, e-mail e uma senha armazenada como hash bcrypt. Na raiz do projeto, você pode gerar o hash de uma senha de teste com:

```bash
node -e "console.log(require('bcrypt').hashSync(process.argv[1], 10))" "troque-por-uma-senha-de-teste"
```

Insira o resultado no campo `password` da tabela `User`, junto com `name`, `email` e `status` ativo. Use no login a senha original.

## Estrutura do projeto

- [`frontend/`](frontend/) — telas, componentes e navegação da aplicação.
- [`backend/src/`](backend/src/) — API e módulos de autenticação, usuários, peso, treinos, alimentos e cardápios.
- [`backend/prisma/`](backend/prisma/) — esquema, migrações e dados para importação de alimentos.

## Comandos de desenvolvimento

| Comando na raiz | Finalidade |
| --- | --- |
| `npm --prefix frontend run lint` | Executar o ESLint no frontend |
| `npm --prefix frontend run build` | Gerar o build do frontend |
| `npm --prefix backend run build` | Compilar a API |
| `npm --prefix backend test` | Executar os testes unitários da API |
| `npm --prefix backend run test:e2e` | Executar a suíte de testes de ponta a ponta da API |
