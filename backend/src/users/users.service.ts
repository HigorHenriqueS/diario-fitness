import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { recuperacaoSenhaTemplate } from '../mail/templates/recuperacao-senha';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
        sexo:true,
        dt_nascimento:true,
        imagem: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status:true,
        sexo:true,
        dt_nascimento:true,
        imagem: true,
      }
    });
  }

  async findByUserIMG(id: number) {
      const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        imagem: true,
        sexo:true,
        dt_nascimento:true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      sexo:user.sexo,
      dt_nascimento:user.dt_nascimento,
      imagem: user.imagem
        ? `data:image/jpeg;base64,${Buffer.from(user.imagem).toString('base64')}`
        : null,
    };
  }

   async enviarRecuperacao(email: string) {
    const html = recuperacaoSenhaTemplate();

    const previewUrl = await this.mailService.enviarEmail(
      email,
      'Recuperação de senha',
      html,
    );

    return {
      message: 'E-mail enviado com sucesso',
      previewUrl,
    };
  }

}
