import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['income', 'expense'])
  type?: 'income' | 'expense';
}