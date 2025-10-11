import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const gatewayDbConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.GATEWAY_DB_HOST || 'localhost',
  port: parseInt(process.env.GATEWAY_DB_PORT || '3306'),
  username: process.env.GATEWAY_DB_USERNAME || 'root',
  password: process.env.GATEWAY_DB_PASSWORD || 'password',
  database: process.env.GATEWAY_DB_NAME || 'gateway_db',
  entities: [],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
};