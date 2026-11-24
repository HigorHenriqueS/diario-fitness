import { Body, Controller, Get, UseGuards, Req, Post, Param,
  UseInterceptors,UploadedFile} from '@nestjs/common';
import { AlimentosService } from './alimentos.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';


@Controller('alimentos')
export class AlimentosController {
  constructor(
    private readonly alimentosService: AlimentosService,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

@UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return this.alimentosService.findAll();
  }
}