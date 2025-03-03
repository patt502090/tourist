import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as apiconfig } from './config/config';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(cookieParser());

  // ปรับแต่ง CORS เพื่ออนุญาตหลาย origin
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173', // Development frontend
        'https://porametix.online', // Production frontend (หรือ URL อื่นที่คุณใช้)
        ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : []), // จาก .env
      ];

      // อนุญาตถ้า origin อยู่ใน allowedOrigins หรือไม่มี origin (เช่น Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked origin: ${origin}`); // Debug ถ้ามี origin ที่ไม่ได้รับอนุญาต
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // HTTP methods ที่อนุญาต
    credentials: true, // รองรับ cookies หรือ credentials
    allowedHeaders: ['Content-Type', 'Authorization'], // Header ที่อนุญาต
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  const port = apiconfig().port || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();