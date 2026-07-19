import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppException } from './common/errors/app.exception';
import { AppConfigService } from './config/app-config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = app.get(AppConfigService);

  if (!config.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MarketCompare API')
      .setDescription(
        'Crowd-sourced local food price comparison for Nigerian markets. ' +
          'Implements API Contracts v1 (KAN-17).',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('auth', 'Account signup, login and session')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    Logger.log('Swagger UI available at /api/docs', 'Bootstrap');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`MarketCompare backend listening on :${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
