import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransactionSvcModule } from './transaction-svc.module';
import { ResponseInterceptor, AllExceptionsFilter } from '@app/shared';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(TransactionSvcModule);
  
  // Apply global interceptor and filter
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Enable CORS
  app.enableCors();
  
  // Setup gRPC Microservice
  const grpcPort = process.env.TRANSACTION_GRPC_PORT ?? '50051';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'transaction',
      protoPath: join(__dirname, '../../../proto/transaction.proto'),
      url: `0.0.0.0:${grpcPort}`,
    },
  });
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Transaction Service API')
    .setDescription('Transaction Management Microservice with gRPC streaming support')
    .setVersion('1.0')
    .addTag('transactions')
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
  
  // Start all microservices
  await app.startAllMicroservices();
  
  const port = process.env.TRANSACTION_SVC_PORT ?? 3001;
  await app.listen(port);
  console.log(`💰 Transaction Service (HTTP) is running on: http://localhost:${port}`);
  console.log(`🔌 Transaction Service (gRPC) is running on: localhost:${grpcPort}`);
  console.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
}
bootstrap();
