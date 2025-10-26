import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Debug environment variables
console.log('🔍 Transaction DB Config Debug:', {
  TRANSACTION_DB_HOST: process.env.TRANSACTION_DB_HOST,
  TRANSACTION_DB_PORT: process.env.TRANSACTION_DB_PORT,
  NODE_ENV: process.env.NODE_ENV,
});

export const transactionDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TRANSACTION_DB_HOST || 'localhost',
  port: parseInt(process.env.TRANSACTION_DB_PORT || (process.env.NODE_ENV === 'development' ? '5433' : '5432')),
  username: process.env.TRANSACTION_DB_USERNAME || 'postgres',
  password: process.env.TRANSACTION_DB_PASSWORD || 'postgres123',
  database: process.env.TRANSACTION_DB_NAME || 'transaction_db',
  entities: [__dirname + '/../../entities/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  dropSchema: process.env.NODE_ENV === 'development' || process.env.DROP_SCHEMA === 'true',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
};