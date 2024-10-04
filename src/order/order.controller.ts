import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entity/order.entity';
import { DeleteResponse, OrderResponse } from './interface/order.interface';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  createOrder(@Body('orderItems') orderItems: Order
  ): Promise<OrderResponse> {
    return this.orderService.createOrder(orderItems);
  }

  @Get()
  getOrders(): Promise<OrderResponse> {
    return this.orderService.getOrders();
  }

  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number): Promise<OrderResponse> {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id')
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() order: Partial<Order>): Promise<OrderResponse> {
    return this.orderService.updateOrder(id, order);
  }

  @Delete(':id')
  deleteOrder(@Param('id', ParseIntPipe) id: number): Promise<DeleteResponse> {
    return this.orderService.deleteOrder(id);
  }
}
