import { Module } from '@nestjs/common';
import { TreinoController } from './treino.controller';
import { TreinoService } from './treino.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [TreinoController],
  providers: [TreinoService],
  exports: [TreinoService],
})
export class TreinoModule {}
