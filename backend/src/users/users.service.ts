import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { recuperacaoSenhaTemplate } from '../mail/templates/recuperacao-senha';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async enviarRecuperacao(user: { id: number; email: string; password: string }) {
    const token = await this.jwtService.signAsync(
      { sub: user.id },
      { secret: this.chaveRecuperacao(user.password), expiresIn: '30m' },
    );
    const link = new URL('/resetar-senha', process.env.FRONTEND_URL || 'http://localhost:3001');
    link.searchParams.set('token', token);

    await this.mailService.enviarEmail(
      user.email,
      'Recuperação de senha',
      recuperacaoSenhaTemplate(link.toString()),
    );
  }

  async resetarSenha(token: unknown, password: unknown) {
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw new BadRequestException('Use pelo menos 8 caracteres e no máximo 72 bytes.');
    }

    const linkInvalido = 'Link inválido ou expirado. Solicite outro na tela de login.';
    if (typeof token !== 'string' || token.length > 2048) {
      throw new BadRequestException(linkInvalido);
    }

    const dados = this.jwtService.decode<{ sub?: number } | null>(token);
    if (!dados || !Number.isSafeInteger(dados.sub)) {
      throw new BadRequestException(linkInvalido);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dados.sub },
      select: { id: true, password: true, status: true },
    });
    if (!user?.status) {
      throw new BadRequestException(linkInvalido);
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.chaveRecuperacao(user.password),
        algorithms: ['HS256'],
      });
    } catch {
      throw new BadRequestException(linkInvalido);
    }

    const senhaHash = await bcrypt.hash(password, 10);
    const resultado = await this.prisma.user.updateMany({
      where: { id: user.id, password: user.password, status: true },
      data: { password: senhaHash },
    });

    if (resultado.count === 0) {
      throw new BadRequestException(linkInvalido);
    }

    return { message: 'Senha alterada com sucesso.' };
  }

  private chaveRecuperacao(senhaHash: string) {
    return createHmac('sha256', this.configService.getOrThrow<string>('JWT_SECRET'))
      .update('recuperacao-senha:' + senhaHash)
      .digest();
  }
}
