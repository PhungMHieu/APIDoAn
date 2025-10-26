import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const gatewayDbConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.GATEWAY_DB_HOST || 'localhost',
  port: parseInt(process.env.GATEWAY_DB_PORT || (process.env.NODE_ENV === 'development' ? '3307' : '3306')),
  username: process.env.GATEWAY_DB_USERNAME || 'mysql_user',
  password: process.env.GATEWAY_DB_PASSWORD || 'mysql123',
  database: process.env.GATEWAY_DB_NAME || 'gateway_db',
  entities: [],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
};