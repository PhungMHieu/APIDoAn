import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus, HttpCode, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionSvcService } from './transaction-svc.service';
import { TransactionEntity } from './entities/transaction.entity';
import { ApiResponse, JwtAuthGuard, CurrentUser, Roles, RolesGuard } from '@app/shared';
import type { CurrentUserData } from '@app/shared';

// Helper function để validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth') // Add JWT authentication requirement in Swagger
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all endpoints with JWT
@Controller('transactions')
export class TransactionSvcController {
  constructor(private readonly transactionSvcService: TransactionSvcService) {}

  @ApiOperation({ summary: 'Get list of available months with transactions' })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of months in format MM/YYYY that have transactions, plus "future"',
    schema: {
      type: 'array', 
      items: { type: 'string' },
      example: ['6/2025', '7/2025', 'future']
    }
  })
  @Get('months')
  async getAvailableMonths(@CurrentUser() user: CurrentUserData): Promise<string[]> {
    return await this.transactionSvcService.getAvailableMonths();
  }

  @ApiOperation({ summary: 'Get my transactions by month/year or future' })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String, 
    description: 'Filter by month and year in format MM/YYYY, or use "future" for all transactions from tomorrow onwards', 
    examples: {
      monthly: {
        summary: 'Get transactions for October 2025',
        value: '10/2025'
      },
      future: {
        summary: 'Get all future transactions',
        value: 'future'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of YOUR transactions filtered by month/year or future. Only returns transactions you created.',
    type: [TransactionEntity]
  })
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('monthYear') monthYear?: string,
  ): Promise<TransactionEntity[]> {
    console.log('Authenticated user:', user);
    // Return only user's own transactions
    return this.transactionSvcService.getTransactionsByUser(user.userId, monthYear);
  }

  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Transaction details',
    type: TransactionEntity
  })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ): Promise<TransactionEntity> {
    if (!isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    
    return await this.transactionSvcService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new transaction with user tracking' })
  @ApiBody({ 
    type: TransactionEntity,
    description: 'Transaction data',
    examples: {
      example1: {
        summary: 'Shopping transaction',
        value: {
          amount: 50000,
          category: 'Shopping',
          note: 'Buy groceries'
        }
      },
      example2: {
        summary: 'Food transaction',
        value: {
          amount: 120000,
          category: 'Food'
        }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 201, 
    description: 'Transaction created successfully',
    type: TransactionEntity
  })
  @Post()
  async create(
    @Body() transactionData: Partial<TransactionEntity>,
    @CurrentUser() user: CurrentUserData
  ): Promise<TransactionEntity> {
    return this.transactionSvcService.createWithUser(user.userId, transactionData);
  }

  @ApiOperation({ 
    summary: 'Update transaction with user verification',
    description: '⚠️ IMPORTANT: Only "amount", "category", "note", and "dateTime" fields can be updated. Fields "id" and "userId" will be IGNORED if included in request body.'
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ 
    description: 'Transaction data to update. Do NOT include "id" or "userId" fields.',
    examples: {
      validUpdate: {
        summary: '✅ Valid update (recommended)',
        value: {
          amount: 75000,
          category: 'Food',
          note: 'Updated lunch expense'
        }
      },
      withDateTime: {
        summary: '✅ Update with custom date',
        value: {
          amount: 100000,
          category: 'Shopping',
          note: 'Buy clothes',
          dateTime: '2025-11-01T10:30:00.000Z'
        }
      },
      invalidWithUserId: {
        summary: '⚠️ userId will be IGNORED',
        description: 'Even if you send userId, it will be ignored and not updated',
        value: {
          amount: 50000,
          note: 'Attempt to change owner',
          userId: '00000000-0000-0000-0000-000000000000'
        }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Transaction updated successfully. Only allowed fields (amount, category, note, dateTime) are updated.',
    type: TransactionEntity
  })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  @SwaggerApiResponse({ status: 403, description: 'You do not have permission to update this transaction. Only the transaction owner can update it.' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() transactionData: Partial<TransactionEntity>,
    @CurrentUser() user: CurrentUserData
  ): Promise<TransactionEntity> {
    if (!isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    
    return await this.transactionSvcService.updateWithUser(id, user.userId, transactionData);
  }

  @ApiOperation({ summary: 'Delete transaction with user verification' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @SwaggerApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  @SwaggerApiResponse({ status: 403, description: 'You do not have permission to delete this transaction' })
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ): Promise<{ message: string }> {
    if (!isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    
    return await this.transactionSvcService.deleteWithUser(id, user.userId);
  }

  @ApiOperation({ summary: 'Get all transactions (Admin only)' })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String, 
    description: 'Filter by month/year (MM/YYYY) or "future"'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of ALL transactions from all users (admin access)',
    type: [TransactionEntity]
  })
  @Roles('admin') // Require admin role
  @Get('all')
  async getAllTransactions(
    @CurrentUser() user: CurrentUserData,
    @Query('monthYear') monthYear?: string
  ): Promise<TransactionEntity[]> {
    return await this.transactionSvcService.findAll(monthYear);
  }

  @ApiOperation({ summary: 'Get transactions by specific user ID' })
  @ApiParam({ name: 'userId', description: 'User ID to get transactions for' })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String, 
    description: 'Filter by month/year (MM/YYYY) or "future"'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of transactions for specific user',
    type: [TransactionEntity]
  })
  @SwaggerApiResponse({ status: 400, description: 'Invalid userId format' })
  @Get('user/:userId')
  async getTransactionsByUserId(
    @CurrentUser() user: CurrentUserData,
    @Param('userId') userId: string,
    @Query('monthYear') monthYear?: string
  ): Promise<TransactionEntity[]> {
    if (!isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format for userId');
    }
    
    return await this.transactionSvcService.getTransactionsByUser(userId, monthYear);
  }

  @ApiOperation({ summary: 'Get transaction IDs owned by current user' })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String, 
    description: 'Filter by month/year (MM/YYYY) or "future"' 
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of transaction IDs owned by user',
    schema: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  @Get('my/ids')
  async getMyTransactionIds(
    @CurrentUser() user: CurrentUserData,
    @Query('monthYear') monthYear?: string
  ): Promise<string[]> {
    return await this.transactionSvcService.getUserTransactionIds(user.userId, monthYear);
  }

  @ApiOperation({ summary: 'Health check endpoint' })
  @SwaggerApiResponse({ status: 200, description: 'Service is running' })
  @Get('hello')
  getHello(): string {
    return this.transactionSvcService.getHello();
  }
}
