import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';

@Injectable()
export class TransactionSvcService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async getAvailableMonths(): Promise<string[]> {
    try {
      // Get all distinct months from transactions
      const transactions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.dateTime')
        .orderBy('transaction.dateTime', 'ASC')
        .getMany();

      // Extract unique months in MM/YYYY format
      const monthsSet = new Set<string>();
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.dateTime);
        const month = (date.getMonth() + 1).toString(); // Month is 0-indexed
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
      
      // Filter by monthYear if provided (format: MM/YYYY)
      if (monthYear) {
        const parts = monthYear.split('/');
        if (parts.length !== 2) {
          throw new BadRequestException('Invalid monthYear format. Use MM/YYYY (e.g., 10/2025)');
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

  // async findByUserId(userId: string): Promise<TransactionEntity[]> {
  //   try {
  //     return await this.transactionRepository.find({
  //       where: { userId },
  //       order: { dateTime: 'DESC' }
  //     });
  //   } catch (error) {
  //     throw new BadRequestException(`Failed to fetch transactions for user ${userId}: ${error.message}`);
  //   }
  // }

  getHello(): string {
    return 'Transaction Service is running successfully!';
  }
}
