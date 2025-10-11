import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsUUID()
  userId: string;
}