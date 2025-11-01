import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { TransactionSvcService } from './transaction-svc.service';
import { TransactionEntity } from './entities/transaction.entity';

interface StreamTransactionsRequest {
  monthYear?: string;
}

interface GetTransactionRequest {
  id: string;
}

interface CreateTransactionRequest {
  userId: string;
  amount: number;
  category: string;
  note?: string;
}

interface UpdateTransactionRequest {
  transactionId: string;
  userId: string;
  amount?: number;
  category?: string;
  note?: string;
}

interface DeleteTransactionRequest {
  transactionId: string;
  userId: string;
}

interface GetUserTransactionIdsRequest {
  userId: string;
  monthYear?: string;
}

interface TransactionResponse {
  id: string;
  amount: number;
  category: string;
  note?: string;
  dateTime: string;
}

interface GrpcTransactionResponse {
  success: boolean;
  message: string;
  transaction?: TransactionResponse;
}

interface DeleteTransactionResponse {
  success: boolean;
  message: string;
}

interface UserTransactionIdsResponse {
  transactionIds: string[];
}

@Controller()
export class TransactionGrpcController {
  constructor(private readonly transactionService: TransactionSvcService) {}

  /**
   * Server-side streaming: Stream all transactions to the client
   */
  @GrpcStreamMethod('TransactionService', 'StreamTransactions')
  streamTransactions(
    request: StreamTransactionsRequest,
  ): Observable<TransactionResponse> {
    const subject = new Subject<TransactionResponse>();

    // Async function to fetch and stream transactions
    (async () => {
      try {
        const transactions = await this.transactionService.findAll(request.monthYear);
        
        // Stream each transaction one by one
        for (const transaction of transactions) {
          subject.next(this.mapToResponse(transaction));
        }
        
        subject.complete();
      } catch (error) {
        subject.error(error);
      }
    })();

    return subject.asObservable();
  }

  /**
   * Get single transaction by ID
   */
  @GrpcMethod('TransactionService', 'GetTransaction')
  async getTransaction(request: GetTransactionRequest): Promise<TransactionResponse> {
    const transaction = await this.transactionService.findOne(request.id);
    return this.mapToResponse(transaction);
  }

  /**
   * Create transaction with user tracking
   */
  @GrpcMethod('TransactionService', 'CreateTransaction')
  async createTransaction(request: CreateTransactionRequest): Promise<GrpcTransactionResponse> {
    try {
      const transaction = await this.transactionService.createWithUser(request.userId, {
        amount: request.amount,
        category: request.category,
        note: request.note,
      });

      return {
        success: true,
        message: 'Transaction created successfully',
        transaction: this.mapToResponse(transaction),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Update transaction with user verification
   */
  @GrpcMethod('TransactionService', 'UpdateTransaction')
  async updateTransaction(request: UpdateTransactionRequest): Promise<GrpcTransactionResponse> {
    try {
      const updateData: Partial<TransactionEntity> = {};
      if (request.amount !== undefined) updateData.amount = request.amount;
      if (request.category !== undefined) updateData.category = request.category;
      if (request.note !== undefined) updateData.note = request.note;

      const transaction = await this.transactionService.updateWithUser(
        request.transactionId,
        request.userId,
        updateData,
      );

      return {
        success: true,
        message: 'Transaction updated successfully',
        transaction: this.mapToResponse(transaction),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Delete transaction with user verification
   */
  @GrpcMethod('TransactionService', 'DeleteTransaction')
  async deleteTransaction(request: DeleteTransactionRequest): Promise<DeleteTransactionResponse> {
    try {
      const result = await this.transactionService.deleteWithUser(
        request.transactionId,
        request.userId,
      );

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get user's transaction IDs
   */
  @GrpcMethod('TransactionService', 'GetUserTransactionIds')
  async getUserTransactionIds(request: GetUserTransactionIdsRequest): Promise<UserTransactionIdsResponse> {
    const transactionIds = await this.transactionService.getUserTransactionIds(
      request.userId,
      request.monthYear,
    );

    return {
      transactionIds,
    };
  }

  /**
   * Map entity to gRPC response
   */
  private mapToResponse(transaction: TransactionEntity): TransactionResponse {
    return {
      id: transaction.id,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      dateTime: transaction.dateTime.toISOString(),
    };
  }
}
