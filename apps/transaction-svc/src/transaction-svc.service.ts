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

  async findAll(): Promise<TransactionEntity[]> {
    try {
      return await this.transactionRepository.find({
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
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
      if (!transactionData.title || !transactionData.amount || !transactionData.type || !transactionData.userId) {
        throw new BadRequestException('Missing required fields: title, amount, type, userId');
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

  async findByUserId(userId: string): Promise<TransactionEntity[]> {
    try {
      return await this.transactionRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch transactions for user ${userId}: ${error.message}`);
    }
  }

  getHello(): string {
    return 'Transaction Service is running successfully!';
  }
}
