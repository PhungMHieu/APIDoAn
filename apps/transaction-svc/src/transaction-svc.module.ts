import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionSvcController } from './transaction-svc.controller';
import { TransactionSvcService } from './transaction-svc.service';
import { getPostgresConfig } from '@app/shared/config/database.config';
import { TransactionEntity } from './entities/transaction.entity';
import { AuthModule } from '@app/shared/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule, // Add authentication support
    TypeOrmModule.forRoot(getPostgresConfig()),
    TypeOrmModule.forFeature([TransactionEntity])
  ],
  controllers: [TransactionSvcController],
  providers: [TransactionSvcService],
})
export class TransactionSvcModule {}
