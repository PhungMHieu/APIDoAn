import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { TransactionEntity } from './entities/transaction.entity';

interface VerifyUserResponse {
  exists: boolean;
  email?: string;
  username?: string;
  roles?: string[];
}

interface AuthServiceClient {
  verifyUser(data: { userId: string }): any;
}

@Injectable()
export class TransactionSvcService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @Inject('AUTH_SERVICE')
    private authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.authClient.getService<AuthServiceClient>('AuthService');
  }

  async getAvailableMonths(): Promise<string[]> {
    try {
      // Get all distinct months from transactions
      const transactions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.dateTime')
        .orderBy('transaction.dateTime', 'ASC')
        .getMany();

      // Extract unique months in MM/YYYY format (with 2-digit month)
      const monthsSet = new Set<string>();
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.dateTime);
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, pad to 2 digits
        const year = date.getFullYear().toString();
        monthsSet.add(`${month}/${year}`);
      });

      // Convert Set to Array and add "future" at the end
      const months = Array.from(monthsSet);
      months.push('future');

      return months;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch available months: ${error.message}`);
    }
  }

  async findAll(monthYear?: string): Promise<TransactionEntity[]> {
    try {
      const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');
      
      // Filter by monthYear if provided (format: MM/YYYY or "future")
      if (monthYear) {
        // Special case: "future" means all transactions from tomorrow onwards
        if (monthYear.toLowerCase() === 'future') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
          
          queryBuilder.where('transaction.dateTime >= :tomorrow', { tomorrow });
        } else {
          // Regular MM/YYYY format
          const parts = monthYear.split('/');
          if (parts.length !== 2) {
            throw new BadRequestException('Invalid monthYear format. Use MM/YYYY (e.g., 10/2025) or "future"');
          }
          
          const month = parseInt(parts[0], 10);
          const year = parseInt(parts[1], 10);
          
          // Validate month and year
          if (isNaN(month) || month < 1 || month > 12) {
            throw new BadRequestException('Month must be between 1 and 12');
          }
          if (isNaN(year) || year < 1900 || year > 2100) {
            throw new BadRequestException('Invalid year');
          }
          
          // Create date range for the specific month
          const startDate = new Date(year, month - 1, 1); // month - 1 because JS months are 0-indexed
          const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month
          
          queryBuilder.where('transaction.dateTime >= :startDate', { startDate })
                      .andWhere('transaction.dateTime <= :endDate', { endDate });
        }
      }
      
      queryBuilder.orderBy('transaction.dateTime', 'DESC');
      
      return await queryBuilder.getMany();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch transactions: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<TransactionEntity> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
      });
      
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
      
      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch transaction: ${error.message}`);
    }
  }

  async create(transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    try {
      // Validate required fields
      if (!transactionData.amount || !transactionData.category) {
        throw new BadRequestException('Missing required fields: amount, category');
      }

      const transaction = this.transactionRepository.create(transactionData);
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create transaction: ${error.message}`);
    }
  }

  async update(id: string, transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    try {
      // Kiểm tra xem transaction có tồn tại không
      const existingTransaction = await this.transactionRepository.findOne({
        where: { id }
      });
      
      if (!existingTransaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      // Cập nhật transaction
      await this.transactionRepository.update(id, transactionData);
      
      // Trả về transaction đã được cập nhật
      const updatedTransaction = await this.transactionRepository.findOne({
        where: { id }
      });
      
      return updatedTransaction!;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update transaction: ${error.message}`);
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      // Kiểm tra xem transaction có tồn tại không
      const existingTransaction = await this.transactionRepository.findOne({
        where: { id }
      });
      
      if (!existingTransaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      await this.transactionRepository.delete(id);
      
      return { message: `Transaction with ID ${id} has been deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete transaction: ${error.message}`);
    }
  }

  /**
   * Create transaction with user tracking
   */
  async createWithUser(userId: string, transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    try {
      // Validate required fields
      if (!transactionData.amount || !transactionData.category) {
        throw new BadRequestException('Missing required fields: amount, category');
      }

      // Verify user exists via gRPC
      const userVerification = await lastValueFrom(
        this.authService.verifyUser({ userId })
      ) as VerifyUserResponse;

      if (!userVerification.exists) {
        throw new NotFoundException('User not found');
      }

      // Create transaction with userId
      const transaction = this.transactionRepository.create({
        ...transactionData,
        userId, // Store userId directly in transaction
      });
      
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Update transaction with user verification
   */
  async updateWithUser(id: string, userId: string, transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    try {
      // Find transaction and check ownership
      const transaction = await this.transactionRepository.findOne({
        where: { id }
      });
      
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      // Check ownership (compare userId directly)
      if (transaction.userId !== userId) {
        throw new ForbiddenException('You do not have permission to update this transaction');
      }

      // Only allow updating specific fields - prevent client from changing id, userId, or other protected fields
      const updateData: Partial<TransactionEntity> = {};
      const allowedFields = ['amount', 'category', 'note', 'dateTime'];
      
      for (const field of allowedFields) {
        if (transactionData[field] !== undefined) {
          updateData[field] = transactionData[field];
        }
      }

      // Update only allowed fields (id and userId will remain unchanged)
      await this.transactionRepository.update(id, updateData);
      
      // Return updated transaction
      const updatedTransaction = await this.transactionRepository.findOne({ where: { id } });
      return updatedTransaction!;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update transaction: ${error.message}`);
    }
  }

  /**
   * Delete transaction with user verification
   */
  async deleteWithUser(id: string, userId: string): Promise<{ message: string }> {
    try {
      // Find transaction and check ownership
      const transaction = await this.transactionRepository.findOne({
        where: { id }
      });
      
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      // Check ownership (compare userId directly)
      if (transaction.userId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this transaction');
      }

      // Delete transaction
      await this.transactionRepository.delete(id);
      
      return { message: `Transaction with ID ${id} has been deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete transaction: ${error.message}`);
    }
  }

  /**
   * Get all transaction IDs for a user
   */
  async getUserTransactionIds(userId: string, monthYear?: string): Promise<string[]> {
    try {
      const transactions = await this.getTransactionsByUser(userId, monthYear);
      return transactions.map(t => t.id);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch user transaction IDs: ${error.message}`);
    }
  }

  /**
   * Get all transactions with full details for a specific user
   */
  async getTransactionsByUser(userId: string, monthYear?: string): Promise<TransactionEntity[]> {
    try {
      // Query transactions directly by userId
      const queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId', { userId });

      // Apply month/year filter if provided
      if (monthYear) {
        if (monthYear.toLowerCase() === 'future') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          
          queryBuilder.andWhere('transaction.dateTime >= :tomorrow', { tomorrow });
        } else {
          const parts = monthYear.split('/');
          if (parts.length === 2) {
            const month = parseInt(parts[0], 10);
            const year = parseInt(parts[1], 10);
            
            if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
              const startDate = new Date(year, month - 1, 1);
              const endDate = new Date(year, month, 0, 23, 59, 59, 999);
              
              queryBuilder
                .andWhere('transaction.dateTime >= :startDate', { startDate })
                .andWhere('transaction.dateTime <= :endDate', { endDate });
            }
          }
        }
      }

      queryBuilder.orderBy('transaction.dateTime', 'DESC');
      
      return await queryBuilder.getMany();
    } catch (error) {
      throw new BadRequestException(`Failed to fetch user transactions: ${error.message}`);
    }
  }

  getHello(): string {
    return 'Transaction Service is running successfully!';
  }
}
