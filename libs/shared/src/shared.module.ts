import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [SharedService],
  exports: [SharedService, DatabaseModule],
})
export class SharedModule {}
