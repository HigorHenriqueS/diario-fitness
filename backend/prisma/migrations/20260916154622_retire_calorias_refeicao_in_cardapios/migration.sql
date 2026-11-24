/*
  Warnings:

  - You are about to drop the column `calorias_refeicao` on the `cardapios` table. All the data in the column will be lost.
  - Made the column `data` on table `cardapios` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `cardapios` DROP COLUMN `calorias_refeicao`,
    MODIFY `data` DATE NOT NULL,
    MODIFY `observacao` TEXT NULL;
