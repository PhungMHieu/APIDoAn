import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransactionSvcModule } from './transaction-svc.module';
import { ResponseInterceptor, AllExceptionsFilter } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(TransactionSvcModule);
  
  // Apply global interceptor and filter
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Enable CORS
  app.enableCors();
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Transaction Service API')
    .setDescription('Transaction Management Microservice')
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
  
  const port = process.env.TRANSACTION_SVC_PORT ?? 3002;
  await app.listen(port);
  console.log(`💰 Transaction Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
}
bootstrap();
