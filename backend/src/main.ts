import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppException } from './common/errors/app.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new AppException(
          'VALIDATION_ERROR',
          'Validation failed',
          errors.map((e) => ({
            field: e.property,
            message: Object.values(e.constraints ?? {}).join('; '),
          })),
        ),
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`MarketCompare backend listening on :${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
