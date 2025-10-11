import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('My Finance API')
    .setDescription('Personal Finance Management System API')
    .setVersion('1.0')
    .addTag('finance')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.MAIN_APP_PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Main Finance App is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
}
bootstrap();
