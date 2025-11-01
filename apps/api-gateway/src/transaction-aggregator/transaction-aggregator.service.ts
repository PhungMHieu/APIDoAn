import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note?: string;
  dateTime: string;
}

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
  success: boolean;
  message: string;
  transaction?: Transaction;
}

interface DeleteTransactionResponse {
  success: boolean;
  message: string;
}

interface UserTransactionIdsResponse {
  transactionIds: string[];
}

interface TransactionService {
  streamTransactions(request: StreamTransactionsRequest): Observable<Transaction>;
  getTransaction(request: GetTransactionRequest): Observable<Transaction>;
  createTransaction(request: CreateTransactionRequest): Observable<TransactionResponse>;
  updateTransaction(request: UpdateTransactionRequest): Observable<TransactionResponse>;
  deleteTransaction(request: DeleteTransactionRequest): Observable<DeleteTransactionResponse>;
  getUserTransactionIds(request: GetUserTransactionIdsRequest): Observable<UserTransactionIdsResponse>;
}

@Injectable()
export class TransactionAggregatorService implements OnModuleInit {
  private transactionService: TransactionService;

  constructor(@Inject('TRANSACTION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.transactionService = this.client.getService<TransactionService>('TransactionService');
  }

  /**
   * Get all transactions for a specific user
   */
  async getUserTransactions(userId: string, monthYear?: string): Promise<Transaction[]> {
    // Get user's transaction IDs from Transaction service
    const idsResponse = await firstValueFrom(
      this.transactionService.getUserTransactionIds({ userId, monthYear })
    );
    
    const userTransactionIds = idsResponse.transactionIds;
    
    if (userTransactionIds.length === 0) {
      return [];
    }
    
    // Stream all transactions from Transaction service
    const transactionsStream = this.transactionService.streamTransactions({ monthYear });
    
    // Collect and filter transactions
    const allTransactions = await firstValueFrom(
      transactionsStream.pipe(toArray())
    );
    
    // Filter by user's transaction IDs
    return allTransactions.filter(t => userTransactionIds.includes(t.id));
  }

  /**
   * Create transaction for user
   */
  async createUserTransaction(userId: string, data: { amount: number; category: string; note?: string }): Promise<TransactionResponse> {
    return firstValueFrom(
      this.transactionService.createTransaction({
        userId,
        amount: data.amount,
        category: data.category,
        note: data.note,
      })
    );
  }

  /**
   * Update user's transaction
   */
  async updateUserTransaction(
    transactionId: string,
    userId: string,
    data: { amount?: number; category?: string; note?: string }
  ): Promise<TransactionResponse> {
    return firstValueFrom(
      this.transactionService.updateTransaction({
        transactionId,
        userId,
        amount: data.amount,
        category: data.category,
        note: data.note,
      })
    );
  }

  /**
   * Delete user's transaction
   */
  async deleteUserTransaction(transactionId: string, userId: string): Promise<DeleteTransactionResponse> {
    return firstValueFrom(
      this.transactionService.deleteTransaction({
        transactionId,
        userId,
      })
    );
  }

  /**
   * Stream transactions in real-time (server-side streaming)
   */
  streamTransactions(monthYear?: string): Observable<Transaction> {
    return this.transactionService.streamTransactions({ monthYear });
  }

  /**
   * Get single transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction> {
    return firstValueFrom(this.transactionService.getTransaction({ id }));
  }
}
