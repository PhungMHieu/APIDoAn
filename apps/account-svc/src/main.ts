import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AccountSvcModule } from './account-svc.module';

async function bootstrap() {
  const app = await NestFactory.create(AccountSvcModule);
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Account Service API')
    .setDescription('Account Management Microservice')
    .setVersion('1.0')
    .addTag('accounts')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.ACCOUNT_SVC_PORT ?? 3003;
  await app.listen(port);
  console.log(`👤 Account Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
}
bootstrap();
