import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const transactionDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TRANSACTION_DB_HOST || 'localhost',
  port: parseInt(process.env.TRANSACTION_DB_PORT || '5432'),
  username: process.env.TRANSACTION_DB_USERNAME || 'postgres',
  password: process.env.TRANSACTION_DB_PASSWORD || 'kakachiz',
  database: process.env.TRANSACTION_DB_NAME || 'transaction_db',
  entities: [__dirname + '/../../entities/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  dropSchema: process.env.NODE_ENV === 'development' || process.env.DROP_SCHEMA === 'true',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
};