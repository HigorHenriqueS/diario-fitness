/*
  Warnings:

  - You are about to drop the column `criadoEm` on the `alimentos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `alimentos` DROP COLUMN `criadoEm`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
