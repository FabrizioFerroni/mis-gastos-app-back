import { configApp } from '@/config/app/config.app';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaginationService } from './services/pagination.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [configApp],
      envFilePath: ['.env'],
    }),
  ],
  providers: [PaginationService],
  exports: [PaginationService],
})
export class CoreModule {}
