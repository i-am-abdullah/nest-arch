import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './auth/guards/permission.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { LoggingInterceptor } from './common/logger/logger.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppLoggerService } from './common/logger/logger.service';
import { createLoggerConfig } from './common/logger/logger.config';

async function bootstrap() {
  // Create app with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createLoggerConfig()),
  });
  
  const reflector = app.get(Reflector);
  const logger = app.get(AppLoggerService);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable API versioning (URI-based: /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  
  const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API description for my project')
  .setVersion('1.0')
  .addBearerAuth()          // optional but common
  .build();
  const document = SwaggerModule.createDocument(app, config);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply global interceptors (order matters!)
  // 1. CorrelationIdInterceptor - adds correlation ID (first)
  // 2. LoggingInterceptor - logs requests/responses
  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(),
    new LoggingInterceptor(logger, reflector),
  );

  // Apply global guards in order:
  // 1. JwtAuthGuard - validates authentication (must be first)
  // 2. PermissionGuard - validates permissions
  // 3. RoleGuard - validates roles
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new PermissionGuard(reflector),
    new RoleGuard(reflector),
  );

  // Apply exception filters (order matters!)
  // 1. HttpExceptionFilter - catches HTTP exceptions (first)
  // 2. AllExceptionsFilter - catches everything else
  app.useGlobalFilters(
    new HttpExceptionFilter(logger),
    new AllExceptionsFilter(logger),
  );
  
  SwaggerModule.setup('api-docs', app, document);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger documentation: http://localhost:${port}/api-docs`, 'Bootstrap');
}
bootstrap();
