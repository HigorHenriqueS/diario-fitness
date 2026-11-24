-- AlterTable
ALTER TABLE `peso` ADD COLUMN `tmb` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `dt_nascimento` DATE NULL,
    ADD COLUMN `sexo` BOOLEAN NULL;
