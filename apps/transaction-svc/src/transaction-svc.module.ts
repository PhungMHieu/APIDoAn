import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TransactionSvcController } from './transaction-svc.controller';
import { TransactionGrpcController } from './transaction-grpc.controller';
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
    TypeOrmModule.forFeature([TransactionEntity]),
    // Add gRPC client for Auth Service
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../../proto/auth.proto'),
          url: process.env.AUTH_GRPC_URL || 'auth-svc:50052',
        },
      },
    ]),
  ],
  controllers: [
    TransactionSvcController,  // HTTP REST controller
    TransactionGrpcController, // gRPC controller
  ],
  providers: [TransactionSvcService],
})
export class TransactionSvcModule {}
