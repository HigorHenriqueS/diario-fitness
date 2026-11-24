import { Body, Controller, Post, Get, UseGuards,Req ,Param } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Console } from 'console';
import { Decimal } from '@prisma/client/runtime/client';
import { CardapiosService } from './cardapios.service';

@Controller('cardapios')
export class CardapiosController {
  constructor(
    private readonly cardapiosService: CardapiosService,
    private readonly prisma: PrismaService,    
  ) {

  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return this.cardapiosService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('getRefeicoes/:id/:data')
  async getPeso(@Param('id') id: number,@Param('data') data: String) {
    return this.prisma.cardapios.findMany({
       where: {
          pessoa_id: Number(id),
          data: new Date(`${data}T00:00:00`),
      },
    });
  }

  @UseGuards(JwtGuard)
  @Post('insertorupdate')
  async insertorupdate(@Body() dados: any) {

    if (dados.id || dados.acao === 'editar' ) {
      
      const card = await this.prisma.cardapios.findFirst({
        where: {
          id: dados.id,
        },
      });
    
      if (card !== null) {

        if(!dados.alimentos){
          await this.prisma.cardapios.update({
            where: {
              id: dados.id,
            },
            data: {
              pessoa_id: dados.pessoa_id,
              alimento_id: dados.alimento_id,
              refeicao: dados.refeicao,
              peso_alimento: dados.peso_alimento,
              calorias_alimento: dados.calorias_alimento,
              observacao: dados.observacao,
            },
          });

          return 1;
        }else{
          dados.alimentos.forEach(async (ali) => {
            await this.prisma.cardapios.update({
              where: {
                id: ali.id,
              },
              data: {
                alimento_id: ali.alimento_id,
                refeicao: ali.refeicao,
                peso_alimento: ali.peso_alimento,
                calorias_alimento: ali.calorias_alimento,
                observacao: ali.observacao,
              },
            });
          });

          return 1;

        }
      }
    }

    // INSERT
    dados.alimentos.forEach(async (ali) => {
      await this.prisma.cardapios.create({
        data: {
          pessoa_id: Number(dados.pessoa_id),
          alimento_id: Number(ali.alimento_id),
          refeicao: dados.refeicao,
          data: new Date(`${dados.data}T00:00:00`),
          peso_alimento: ali.peso,
          calorias_alimento: ali.calorias,
          observacao: dados.observacao,
        },
      });
    });

    return 1;
  }

  @UseGuards(JwtGuard)
  @Post('deletar_refeicao')
  async deletar_refeicao(@Req() req) {

    await this.prisma.cardapios.delete({
        where: {
          id: Number(req.body.refeicao_id),
        },
        
      });
    
      return 1;
  }

}