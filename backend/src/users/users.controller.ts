import { Body, Controller, Get, UseGuards, Req, Post, Param,
  UseInterceptors,UploadedFile} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async findMe(@Req() req) {
    return this.usersService.findByUserIMG(req.user.userId);
  }

  @UseGuards(JwtGuard)
  @Get('getuser/:id')
  async getuser(@Param('id') id: number) {
    return this.usersService.findByUserIMG(Number(id));
  }

  @UseGuards(JwtGuard)
  @Post('insertorupdate')
  @UseInterceptors(FileInterceptor('imagem'))
  async insertorupdate(
    @Body() dados: any,
    @UploadedFile() imagem: Express.Multer.File,
  ) {

      let senhaHash: string | undefined;
      let sexo = dados.sexo === '0' ?  false : true;

      if(dados.password){
        senhaHash = await bcrypt.hash(dados.password, 10);
      }
    
      if (dados.id && dados.id !== 'undefined') {
          const user = await this.prisma.user.findFirst({
        where: {
          email: dados.email,
          id:{
            not: Number(dados.id),
          }
          
        },
      });
      
      if(user !== null){
        return 0;
      }
      await this.prisma.user.update({
        where: {
          id: Number(dados.id),
        },
        data: {
          name: dados.name,
          email: dados.email,
          sexo: sexo,
          dt_nascimento: new Date(`${dados.dt_nascimento}T00:00:00`),
          ...(senhaHash ? { password: senhaHash }  : {}),
          ...(imagem?.buffer && {
          imagem: new Uint8Array(imagem.buffer),
        }),
        },
      });
    }else{
        const user = await this.prisma.user.findFirst({
          where: {
            email: dados.email
          },
        });
        
        if(user !== null){
          return 0;
        }
      await this.prisma.user.create({
        data: {
          name: dados.name,
          email: dados.email,
          sexo: sexo,
          dt_nascimento: new Date(`${dados.dt_nascimento}T00:00:00`),
          password: senhaHash!,
          imagem: imagem?.buffer
          ? new Uint8Array(imagem.buffer)
          : null,
        },
      });
    }

    return 1;

  }


  @UseGuards(JwtGuard)
  @Post('ativa_inativa_user')
  async ativa_inativa_user(@Req() req) {
     const user = await this.prisma.user.findFirst({
      where: {
        id: Number(req.body.id),
      },
    });

    user!.status === true ? user!.status = false : user!.status = true;

    await this.prisma.user.update({
        where: {
          id: Number(req.body.id),
        },
        data: {
          status: user!.status,
         
        },
      });
    
      return user!.status;
  }


  @UseGuards(JwtGuard)
  @Post('deletar_usuario')
  async deletar_usuario(@Req() req) {

    await this.prisma.user.delete({
        where: {
          id: Number(req.body.id),
        },
        
      });
    
      return 1;
  }

  @UseGuards(JwtGuard)
  @Post('filtrar_users')
  async filtrar_users(@Req() req) {

    const where: any = {};

     const {
    users_filtro,
    email,
    status,
  } = req.body.filtros;

    if (users_filtro?.length > 0) {
      where.id = {
        in: users_filtro,
      };
    }
    if (email !== "") {
      where.email = {
        contains: email,
      };
    }

    if (status !== "") {
      where.status = status == 0 ? false : true;
    }

    return this.prisma.user.findMany({
      where,
    });

  }

  @Post('verificar_email')
  async verificar_email(@Req() req) {
   const email = req.body.email
   const vef_email = await this.prisma.user.findFirst({
      where: {
        email: email,
        status: true
      },
      
    });
  
    if(vef_email === null){
      return 0;
    }else{
      return this.usersService.enviarRecuperacao(email);
    }
  }

}
