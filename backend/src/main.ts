import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as apiconfig } from './config/config';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io'; // เพิ่ม Socket.IO adapter

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ตั้งค่า Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN
      : 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Leetcode backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = apiconfig().port || 3000; // default port ถ้า apiconfig().port ไม่มีค่า
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();