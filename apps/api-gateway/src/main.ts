import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Main API Gateway for My Finance System')
    .setVersion('1.0')
    .addTag('gateway')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.API_GATEWAY_PORT ?? 3001;
  await app.listen(port);
  console.log(`🌐 API Gateway is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
}
bootstrap();
