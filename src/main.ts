import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: 'https://cute-sprite-a9f896.netlify.app',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App running on port ${process.env.PORT || 3000}`);
}
bootstrap();
