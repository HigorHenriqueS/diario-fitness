-- CreateTable
CREATE TABLE `Treino` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pessoa_id` INTEGER NOT NULL,
    `nome` INTEGER NOT NULL,
    `descricao` TEXT NOT NULL,
    `grupo_muscular` VARCHAR(191) NOT NULL,
    `imagem` LONGBLOB NULL,
    `series` INTEGER NOT NULL,
    `repeticoes` VARCHAR(191) NOT NULL,
    `observacao` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Treino` ADD CONSTRAINT `Treino_pessoa_id_fkey` FOREIGN KEY (`pessoa_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
