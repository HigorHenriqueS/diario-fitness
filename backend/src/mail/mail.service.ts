import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  async onModuleInit() {
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('E-mail de teste configurado.');
  }

  async enviarEmail(
    destinatario: string,
    assunto: string,
    html: string,
    ) {
    const info = await this.transporter.sendMail({
        from: '"Meu Projeto" <teste@projeto.local>',
        to: destinatario,
        subject: assunto,
        html: html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log('📧 E-mail enviado!');
    console.log('🔗 Preview:', previewUrl);

    return previewUrl;
    }

}
