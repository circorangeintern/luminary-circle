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

  /**
   * CORS SETUP
   */
  const allowedOrigins = config.corsAllowedOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Anchored both ends — an unanchored pattern would match
  // evil-site.vercel.app.attacker.com
  const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow: boolean) => void) => {
      if (!origin) return callback(null, true); // curl, Postman, same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (config.corsAllowVercelPreviews && VERCEL_PREVIEW.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'Idempotency-Key'],
    credentials: false, // auth is a Bearer header, not cookies — no CSRF surface
    maxAge: 86400,
  });
  


  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`MarketCompare backend listening on :${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
