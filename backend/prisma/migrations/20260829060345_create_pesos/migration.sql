-- CreateTable
CREATE TABLE `Peso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `peso` DECIMAL(65, 30) NOT NULL,
    `altura` DECIMAL(65, 30) NOT NULL,
    `imc` DECIMAL(65, 30) NULL,
    `data` DATE NOT NULL,
    `observacao` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
