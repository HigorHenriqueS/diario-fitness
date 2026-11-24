-- CreateTable
CREATE TABLE `Alimentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `calorias` DECIMAL(65, 30) NULL,
    `proteinas` DECIMAL(65, 30) NULL,
    `carboidratos` DECIMAL(65, 30) NULL,
    `gorduras` DECIMAL(65, 30) NULL,
    `fibras` DECIMAL(65, 30) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Alimentos_nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
