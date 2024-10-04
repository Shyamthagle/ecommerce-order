import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CacheModule.register()],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
