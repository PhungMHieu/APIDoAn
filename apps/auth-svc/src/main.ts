import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthSvcModule } from './auth-svc.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthSvcModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Setup gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../proto/auth.proto'),
      url: process.env.AUTH_GRPC_URL || '0.0.0.0:50052',
    },
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and Authorization Service for My Finance')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.AUTH_SVC_PORT || 3003;
  
  // Start both HTTP and gRPC
  await app.startAllMicroservices();
  await app.listen(port);
  
  console.log(`🚀 Auth Service (HTTP) is running on: http://localhost:${port}`);
  console.log(`🔌 Auth Service (gRPC) is running on: ${process.env.AUTH_GRPC_URL || 'localhost:50052'}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
