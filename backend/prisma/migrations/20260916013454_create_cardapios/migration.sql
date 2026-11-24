-- CreateTable
CREATE TABLE `Cardapios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pessoa_id` INTEGER NOT NULL,
    `alimento_id` INTEGER NOT NULL,
    `data` DATE NULL,
    `refeicao` INTEGER NOT NULL,
    `peso_alimento` DECIMAL(65, 30) NOT NULL,
    `calorias_alimento` DECIMAL(65, 30) NOT NULL,
    `calorias_refeicao` DECIMAL(65, 30) NOT NULL,
    `observacao` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cardapios` ADD CONSTRAINT `Cardapios_pessoa_id_fkey` FOREIGN KEY (`pessoa_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cardapios` ADD CONSTRAINT `Cardapios_alimento_id_fkey` FOREIGN KEY (`alimento_id`) REFERENCES `Alimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
