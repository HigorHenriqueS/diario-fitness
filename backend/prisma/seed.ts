import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { createMariaDbAdapter } from "../src/prisma/mariadb-adapter";
import alimentos from "./foods.json";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Defina DATABASE_URL antes de importar os alimentos.");
}

const prisma = new PrismaClient({ adapter: createMariaDbAdapter(databaseUrl) });

async function main() {
  console.log("Iniciando importação...");

  await prisma.alimentos.createMany({
    data: alimentos,
  });

  console.log("Alimentos cadastrados com sucesso!");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
