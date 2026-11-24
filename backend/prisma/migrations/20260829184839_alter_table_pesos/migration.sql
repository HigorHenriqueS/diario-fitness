/*
  Warnings:

  - You are about to drop the column `nome` on the `peso` table. All the data in the column will be lost.
  - Added the required column `pessoa_id` to the `Peso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `peso` DROP COLUMN `nome`,
    ADD COLUMN `pessoa_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Peso` ADD CONSTRAINT `Peso_pessoa_id_fkey` FOREIGN KEY (`pessoa_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
