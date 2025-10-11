import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'my_finance_db',
  entities: [User, Transaction],
  synchronize: process.env.NODE_ENV !== 'production', // Chỉ sync khi không phải production
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
};