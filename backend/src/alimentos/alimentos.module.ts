import { Module } from '@nestjs/common';
import { AlimentosService } from './alimentos.service';
import { AlimentosController } from './alimentos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule,AuthModule],
  providers: [AlimentosService],
  controllers: [AlimentosController],
  exports: [AlimentosService],
})
export class AlimentosModule {}
