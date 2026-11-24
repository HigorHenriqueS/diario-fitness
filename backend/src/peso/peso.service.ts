import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PesoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.peso.findMany({
      select: {
        id: true,
        pessoa_id: true,
        peso: true,
        altura: true,
        imc: true,
        data: true,
        observacao: true,
        createdAt: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.peso.findUnique({
      where: { id },
      select: {
        id: true,
        pessoa_id: true,
        peso: true,
        altura: true,
        imc: true,
        data: true,
        observacao: true,
        createdAt: true,
      }
    });
  }

}
