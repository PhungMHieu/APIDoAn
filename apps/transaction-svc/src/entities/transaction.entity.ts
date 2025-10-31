import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transactions')
export class TransactionEntity {
  @ApiProperty({ 
    description: 'Unique identifier for the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ApiProperty({ 
  //   description: 'Transaction title',
  //   example: 'Lunch at restaurant'
  // })
  // @Column({ type: 'varchar', length: 255 })
  // title: string;

  @ApiProperty({ 
    description: 'Transaction amount',
    example: 50000
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ 
    description: 'Transaction category',
    example: 'food'
  })
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @ApiProperty({ 
    description: 'Optional transaction description',
    example: 'Lunch with colleagues',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  note?: string;

  // @ApiProperty({ 
  //   description: 'Transaction type',
  //   enum: ['income', 'expense'],
  //   example: 'expense'
  // })
  // @Column({ type: 'enum', enum: ['income', 'expense'] })
  // type: 'income' | 'expense';

  // @ApiProperty({ 
  //   description: 'User ID who owns this transaction',
  //   example: '123e4567-e89b-12d3-a456-426614174000'
  // })
  // @Column({ type: 'uuid' })
  // userId: string;

  @ApiProperty({ 
    description: 'Transaction creation timestamp',
    example: '2025-10-31T00:00:00.000Z',
    type: Date
  })
  @CreateDateColumn({ name: 'dateTime' })
  dateTime: Date;

  // @ApiProperty({ 
  //   description: 'Transaction last update timestamp'
  // })
  // @UpdateDateColumn()
  // updatedAt: Date;
}