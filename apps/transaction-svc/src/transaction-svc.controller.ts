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

  @ApiOperation({ summary: 'Get transactions by month/year' })
  @ApiQuery({ 
    name: 'monthYear', 
    required: false, 
    type: String, 
    description: 'Filter by month and year in format MM/YYYY', 
    example: '10/2025' 
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of transactions filtered by month/year. If no monthYear provided, returns all transactions.',
    type: [TransactionEntity]
  })
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('monthYear') monthYear?: string,
  ): Promise<TransactionEntity[]> {
    console.log('Authenticated user:', user);
    return this.transactionSvcService.findAll(monthYear);
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

  @ApiOperation({ summary: 'Create new transaction' })
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
  async create(@Body() transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    return this.transactionSvcService.create(transactionData);
  }

  @ApiOperation({ summary: 'Update transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ type: TransactionEntity, description: 'Updated transaction data' })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Transaction updated successfully',
    type: TransactionEntity
  })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() transactionData: Partial<TransactionEntity>
  ): Promise<TransactionEntity> {
    if (!isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    
    return await this.transactionSvcService.update(id, transactionData);
  }

  @ApiOperation({ summary: 'Delete transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @SwaggerApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @SwaggerApiResponse({ status: 404, description: 'Transaction not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    if (!isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    
    return await this.transactionSvcService.delete(id);
  }

  @ApiOperation({ summary: 'Get transactions by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'List of user transactions',
    type: [TransactionEntity]
  })
  // @Get('user/:userId')
  // async findByUserId(@Param('userId') userId: string): Promise<TransactionEntity[]> {
  //   if (!isValidUUID(userId)) {
  //     throw new BadRequestException('Invalid UUID format for userId');
  //   }
    
  //   return await this.transactionSvcService.findByUserId(userId);
  // }

  @ApiOperation({ summary: 'Health check endpoint' })
  @SwaggerApiResponse({ status: 200, description: 'Service is running' })
  @Get('hello')
  getHello(): string {
    return this.transactionSvcService.getHello();
  }
}
