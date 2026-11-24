import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TreinoService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
    return this.prisma.treino.findMany({
        select: {
        id: true,
        pessoa_id: true,
        nome: true,
        descricao: true,
        grupo_muscular: true,
        imagem: true,
        series: true,
        repeticoes: true,
        observacao: true,
        createdAt: true,
        updatedAt: true,
        },
    });
    }

    async findById(id: number) {
    return this.prisma.treino.findUnique({
        where: { id },
        select: {
        id: true,
        pessoa_id: true,
        nome: true,
        descricao: true,
        grupo_muscular: true,
        imagem: true,
        series: true,
        repeticoes: true,
        observacao: true,
        createdAt: true,
        updatedAt: true,
        }
    });
    }
}
