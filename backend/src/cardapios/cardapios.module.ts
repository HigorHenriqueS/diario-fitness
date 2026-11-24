import { Module } from '@nestjs/common';
import { CardapiosController } from './cardapios.controller';
import { CardapiosService } from './cardapios.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [CardapiosController],
  providers: [CardapiosService],
  exports: [CardapiosService],
})
export class CardapiosModule {}
