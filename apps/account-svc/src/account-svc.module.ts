import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSvcController } from './account-svc.controller';
import { AccountSvcService } from './account-svc.service';
import { accountDbConfig } from '@app/shared/database/account-db.config';
import { UserMongo, UserSchema } from '@app/shared/schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(accountDbConfig.uri || 'mongodb://localhost:27017/account_db'),
    MongooseModule.forFeature([{ name: UserMongo.name, schema: UserSchema }])
  ],
  controllers: [AccountSvcController],
  providers: [AccountSvcService],
})
export class AccountSvcModule {}
