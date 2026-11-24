import {
    Body, Controller, Get, UseGuards, Req, Post, Param,
    UseInterceptors, UploadedFile
} from '@nestjs/common';
import { TreinoService } from './treino.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Console } from 'console';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'fs';
import path from 'path';

@Controller('treino')
export class TreinoController {
    constructor(
        private readonly treinoService: TreinoService,
        private readonly prisma: PrismaService,
    ) {
    }
    @UseGuards(JwtGuard)
    @Get()
    async findAll(@Req() req) {
        return this.prisma.treino.findMany({
            include: {
                pessoa: true,
            },
            where:{
                pessoa_id : req.user.userId
            },
            orderBy: {
                id: "asc",
            },
        });
    }

    @Get('getExercicio/:id')
    async getPeso(@Param('id') id: number) {
        return this.treinoService.findById(Number(id));
    }


    @Post('formulario_treino/insertorupdate')
    @UseInterceptors(FileInterceptor('imagem'))
    async insertorupdate(
        @UploadedFile() imagem: Express.Multer.File,
        @Body() dados: any,
    ) {
        // UPDATE
        if (dados.id != 'null') {
            const treino = await this.prisma.treino.findFirst({
                where: {
                    id: Number(dados.id),
                },
            });

            if (treino !== null) {
                await this.prisma.treino.update({
                    where: {
                        id: Number(dados.id),
                    },
                    data: {
                        nome: dados.nome,
                        pessoa_id: 1,
                        descricao: dados.descricao,
                        grupo_muscular: dados.grupo_muscular,
                        series: Number(dados.series),
                        repeticoes: dados.repeticoes,
                        imagem: imagem?.buffer
                            ? new Uint8Array(imagem.buffer)
                            : null,
                        observacao: dados.observacao,
                    },
                });

                return 1;
            }
        }

        const imagemPadrao = fs.readFileSync(
            path.join(process.cwd(), 'src', 'img', 'treino_logo.png')
        );
        // INSERT
        await this.prisma.treino.create({
            data: {
                nome: dados.nome,
                pessoa_id: 1,
                descricao: dados.descricao,
                grupo_muscular: dados.grupo_muscular,
                series: Number(dados.series),
                repeticoes: dados.repeticoes,
                imagem: imagem?.buffer
                    ? new Uint8Array(imagem.buffer)
                    : new Uint8Array(imagemPadrao),
                observacao: dados.observacao,
            },
        });

        return 1;
    }

    @UseGuards(JwtGuard)
    @Post('filtrar_exercicio')
    async filtrar_exercicio(@Req() req) {

        const where: any = {};

        const {
            tipo,
            filtro,
        } = req.body.filtros;

        if (tipo === 'categoria' && filtro !== 'Todos') {
            where.grupo_muscular = filtro
                        }

        if (tipo === 'nome_exercicio') {
            where.nome = {
                contains: filtro,
            };
        }
        
        where.pessoa_id = req.user.userId

        return this.prisma.treino.findMany({
            where,
            include: {
                pessoa: true,
            },
        });

    }

}