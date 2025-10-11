import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getPostgresConfig = (): TypeOrmModuleOptions => {
  const isDocker = process.env.NODE_ENV === 'production';
  
  return {
    type: 'postgres',
    host: isDocker ? 'postgres-db' : 'localhost',
    port: isDocker ? 5432 : 5433,
    username: 'postgres',
    password: 'postgres123',
    database: 'transaction_db',
    autoLoadEntities: true,
    synchronize: true, // Set to false in production
    logging: process.env.NODE_ENV !== 'production',
  };
};

export const getMongoConfig = () => {
  const isDocker = process.env.NODE_ENV === 'production';
  const host = isDocker ? 'mongodb' : 'localhost';
  const port = isDocker ? 27017 : 27018;
  
  return `mongodb://admin:admin123@${host}:${port}/account_db?authSource=admin`;
};

export const getMysqlConfig = (): TypeOrmModuleOptions => {
  const isDocker = process.env.NODE_ENV === 'production';
  
  return {
    type: 'mysql',
    host: isDocker ? 'mysql-db' : 'localhost',
    port: isDocker ? 3306 : 3307,
    username: 'mysql_user',
    password: 'mysql123',
    database: 'gateway_db',
    autoLoadEntities: true,
    synchronize: true, // Set to false in production
    logging: process.env.NODE_ENV !== 'production',
  };
};