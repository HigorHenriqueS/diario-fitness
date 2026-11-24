import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlimentosService {
    constructor(private readonly prisma: PrismaService) {}


    async findAll() {
    return this.prisma.alimentos.findMany({
      select: {
        id: true,
        nome:true,
        calorias: true,
        proteinas: true,
        carboidratos: true,
        gorduras: true,
        fibras:true,
        createdAt:true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.alimentos.findUnique({
      where: { id },
      select: {
        id: true,
        nome:true,
        calorias: true,
        proteinas: true,
        carboidratos: true,
        gorduras: true,
        fibras:true,
        createdAt:true,
      }
    });
  }
}
