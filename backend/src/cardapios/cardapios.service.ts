import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardapiosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cardapios.findMany({
      select: {
        id: true,
        pessoa_id: true,
        alimento_id: true,
        data: true,
        refeicao: true,
        peso_alimento: true,
        calorias_alimento: true,
        observacao: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.cardapios.findUnique({
      where: { id },
      select: {
        id: true,
        pessoa_id: true,
        alimento_id: true,
        data: true,
        refeicao: true,
        peso_alimento: true,
        calorias_alimento: true,
        observacao: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

}
