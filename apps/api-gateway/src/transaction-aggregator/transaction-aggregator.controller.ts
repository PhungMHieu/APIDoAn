import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionAggregatorService } from './transaction-aggregator.service';
import { JwtAuthGuard, CurrentUser } from '@app/shared';
import type { CurrentUserData } from '@app/shared';

@ApiTags('transaction-aggregator')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('aggregator/transactions')
export class TransactionAggregatorController {
  constructor(private readonly aggregatorService: TransactionAggregatorService) {}

  @Get('my-transactions')
  @ApiOperation({ 
    summary: 'Get current user transactions via gRPC',
    description: 'Aggregates transactions for the authenticated user using gRPC streaming from Transaction service'
  })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String,
    description: 'Filter by month (MM/YYYY) or "future"'
  })
  @ApiResponse({ status: 200, description: 'User transactions retrieved successfully' })
  async getMyTransactions(
    @CurrentUser() user: CurrentUserData,
    @Query('monthYear') monthYear?: string,
  ): Promise<any> {
    // Get user's transactions via gRPC streaming
    const transactions = await this.aggregatorService.getUserTransactions(user.userId, monthYear);
    
    return {
      userId: user.userId,
      email: user.email,
      totalTransactions: transactions.length,
      transactions,
    };
  }

  @Sse('stream')
  @ApiOperation({ 
    summary: 'Server-Sent Events: Stream transactions in real-time',
    description: 'Uses gRPC server-side streaming to push transactions to client via SSE'
  })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String,
    description: 'Filter by month (MM/YYYY) or "future"'
  })
  streamTransactions(
    @CurrentUser() user: CurrentUserData,
    @Query('monthYear') monthYear?: string,
  ): Observable<MessageEvent> {
    // Stream transactions via gRPC and convert to SSE format
    return this.aggregatorService.streamTransactions(monthYear).pipe(
      map((transaction) => ({
        data: transaction,
      } as MessageEvent))
    );
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new transaction for current user',
    description: 'Creates a transaction and associates it with the authenticated user via gRPC'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 150000 },
        category: { type: 'string', example: 'Food' },
        note: { type: 'string', example: 'Dinner at restaurant' }
      },
      required: ['amount', 'category']
    }
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async createTransaction(
    @CurrentUser() user: CurrentUserData,
    @Body() data: { amount: number; category: string; note?: string },
  ): Promise<any> {
    const result = await this.aggregatorService.createUserTransaction(user.userId, data);
    return result;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update user transaction',
    description: 'Updates a transaction owned by the authenticated user via gRPC'
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 200000 },
        category: { type: 'string', example: 'Transport' },
        note: { type: 'string', example: 'Taxi to airport' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your transaction' })
  async updateTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() data: { amount?: number; category?: string; note?: string },
  ): Promise<any> {
    const result = await this.aggregatorService.updateUserTransaction(id, user.userId, data);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete user transaction',
    description: 'Deletes a transaction owned by the authenticated user via gRPC'
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your transaction' })
  async deleteTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<any> {
    const result = await this.aggregatorService.deleteUserTransaction(id, user.userId);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID via gRPC' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<any> {
    const transaction = await this.aggregatorService.getTransaction(id);
    return transaction;
  }
}
