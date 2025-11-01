import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  note?: string;
}