import { MongooseModuleOptions } from '@nestjs/mongoose';

export const accountDbConfig: MongooseModuleOptions = {
  uri: process.env.MONGODB_URI || 
       `mongodb://${process.env.ACCOUNT_DB_USERNAME || 'admin'}:${process.env.ACCOUNT_DB_PASSWORD || 'admin123'}@${process.env.ACCOUNT_DB_HOST || 'localhost'}:${process.env.ACCOUNT_DB_PORT || (process.env.NODE_ENV === 'development' ? '27018' : '27017')}/${process.env.ACCOUNT_DB_NAME || 'account_db'}?authSource=admin`,
};