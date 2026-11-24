import { Module } from '@nestjs/common';
import { PesoController } from './peso.controller';
import { PesoService } from './peso.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule,AuthModule,UsersModule],
  controllers: [PesoController],
  providers: [PesoService],
  exports: [PesoService],
})
export class PesoModule {}
