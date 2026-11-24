import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PesoModule } from './peso/peso.module';
import { TreinoModule } from './treino/treino.module';
import { AlimentosModule } from './alimentos/alimentos.module';
import { CardapiosModule } from './cardapios/cardapios.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    UsersModule,
    AuthModule,
    PesoModule,
    TreinoModule,
    AlimentosModule,
    CardapiosModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}