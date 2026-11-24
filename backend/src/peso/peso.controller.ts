import { Body, Controller, Post, Get, UseGuards,Req ,Param } from '@nestjs/common';
import { PesoService } from './peso.service';
import { UsersService } from '../users/users.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Console } from 'console';
import { Decimal } from '@prisma/client/runtime/client';

@Controller('peso')
export class PesoController {
  constructor(
    private readonly pesoService: PesoService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
  return this.prisma.peso.findMany({
      include: {
        pessoa: true,
      },
       orderBy: {
        data: "asc",
      },
    });
  }

  @UseGuards(JwtGuard)
  @Get('getPeso/:id')
  async getPeso(@Param('id') id: number) {
    return this.pesoService.findById(Number(id));
  }

  @UseGuards(JwtGuard)
  @Get('getPesobyUser/:id')
  async getPesobyUser(@Param('id') id: number) {
    return this.prisma.peso.findMany({
       where: {
          pessoa_id: Number(id),
      },
      include: {
        pessoa: true,
      },
    });
  }

  @UseGuards(JwtGuard)
  @Get('getLastPesoUser/:id')
  async getLastPesoUser(@Param('id') id: number) {
    return this.prisma.peso.findFirst({
      where: {
        pessoa_id: Number(id),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Post('formulario_peso/insertorupdate')
  async insertorupdate(@Body() dados: any) {
    // UPDATE

    const get_pessoa = await this.usersService.findById(Number(dados.pessoa_id));
    let tmb = 0;
    const alturaCm = Number(dados.altura) * 100;
    if(!get_pessoa  || !get_pessoa.dt_nascimento  || !get_pessoa.sexo){
      return 0;
    }else{
      const hoje = new Date();
      let idade = hoje.getFullYear() - get_pessoa.dt_nascimento.getFullYear();

      const mesAtual = hoje.getMonth();
      const mesNascimento = get_pessoa.dt_nascimento.getMonth();

      if (
        mesAtual < mesNascimento ||
        (mesAtual === mesNascimento && hoje.getDate() < get_pessoa.dt_nascimento.getDate())
      ) {
        idade--;
      }

      if(get_pessoa.sexo === true){
        tmb = (10 * Number(dados.peso)) + (6.25 * Number(alturaCm)) - (5 * Number(idade)) + 5;
      }else{
        tmb = (10 * Number(dados.peso)) + (6.25 * Number(alturaCm)) - (5 * Number(idade)) - 161;
      }

    }

    if (dados.id) {
      const peso = await this.prisma.peso.findFirst({
        where: {
          id: dados.id,
        },
      });

      if (peso !== null) {
        await this.prisma.peso.update({
          where: {
            id: dados.id,
          },
          data: {
            peso: dados.peso,
            altura: dados.altura,
            imc: dados.imc,
            tmb: tmb,
            data: new Date(`${dados.data}T00:00:00`),
            observacao: dados.observacao,
          },
        });

        return 1;
      }
    }

    // INSERT
    await this.prisma.peso.create({
      data: {
        pessoa_id: dados.pessoa_id,
        peso: dados.peso,
        altura: dados.altura,
        imc: dados.imc,
        tmb: tmb,
        data: new Date(`${dados.data}T00:00:00`),
        observacao: dados.observacao,
      },
    });

    return 1;
  }

  @UseGuards(JwtGuard)
  @Post('filtrar_pesos')
  async filtrar_pesos(@Req() req) {

    const where: any = {};

    const {
        pessoas_filtro,
        data_ini,
        data_fim,
      } = req.body.filtros;

    if (pessoas_filtro?.length > 0) {
      where.pessoa_id = {
        in: pessoas_filtro,
      };
    }

    if (data_ini !== "") {
      where.data = {
        gte: new Date(`${data_ini}T00:00:00`),
      };
    }

    if (data_fim !== "") {
      where.data = {
        ...where.data,
        lte: new Date(`${data_fim}T23:59:59`),
      };
    }

    return this.prisma.peso.findMany({
      where,
      include: {
        pessoa: true,
      },
    });

    }

  @UseGuards(JwtGuard)
  @Post('deletar_peso')
  async deletar_peso(@Req() req) {
    
    await this.prisma.peso.delete({
        where: {
          id: Number(req.body.id),
        },
        
      });
    
      return 1;
  }
  
}
