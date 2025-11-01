import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TransactionAggregatorController } from './transaction-aggregator.controller';
import { TransactionAggregatorService } from './transaction-aggregator.service';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRANSACTION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'transaction',
          protoPath: join(__dirname, '../../../proto/transaction.proto'),
          url: process.env.TRANSACTION_GRPC_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [TransactionAggregatorController],
  providers: [TransactionAggregatorService],
})
export class TransactionAggregatorModule {}
