import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export function createMariaDbAdapter(databaseUrl: string): PrismaMariaDb {
  // O Prisma CLI usa mysql:// e o driver espera mariadb://.
  return new PrismaMariaDb(databaseUrl.replace(/^mysql:\/\//, 'mariadb://'));
}
