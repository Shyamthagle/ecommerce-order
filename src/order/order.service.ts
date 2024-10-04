import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import {
    OrderNotFoundException,
    OrderCreationException,
    OrderUpdateException,
    OrderDeletionException,
    NoFieldsProvidedException,
} from './exceptions/order.exceptions';
import { DeleteResponse, OrderResponse } from './interface/order.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        // @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async createOrder(orderItems: Order): Promise<OrderResponse> {
        try {
            const data = await this.orderRepository.save(orderItems);
            return {
                success: true,
                message: 'Order created successfully',
                data: data,
            }
        } catch (error) {
            throw new OrderCreationException;
        }
    }

    async getOrders(): Promise<OrderResponse> {
        try {


            const [data, count] = await this.orderRepository.findAndCount();
            return {
                success: true,
                message: 'Orders retrieved successfully',
                count: count,
                data: data,
            }


        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getProductById(orderId: number): Promise<OrderResponse> {
        try {
            const data: Order = await this.orderRepository.findOne({ where: { id: orderId } });
            return {
                success: true,
                message: 'Order retrieved successfully',
                data: data,
            }

        } catch (error) {
            throw new OrderNotFoundException(orderId)
        }
    }

    async updateOrder(orderId: number, order: Partial<Order>): Promise<OrderResponse> {
        try {
            const existingOrder = await this.orderRepository.findOne({ where: { id: orderId } });
            if (!existingOrder) {
                throw new OrderNotFoundException(orderId);
            }

            if (Object.keys(order).length === 0) {
                throw new NoFieldsProvidedException();
            }

            await this.orderRepository.update(orderId, order);

            const updatedOrder = await this.orderRepository.findOne({ where: { id: orderId } });
            return {
                success: true,
                message: 'Order updated successfully',
                data: updatedOrder,
            }
        } catch (error) {
            throw new OrderUpdateException();
        }
    }

    async deleteOrder(orderId: number): Promise<DeleteResponse> {
        try {
            const existingOrder = await this.orderRepository.findOne({ where: { id: orderId } });
            if (!existingOrder) {
                throw new OrderNotFoundException(orderId);
            }
            await this.orderRepository.delete(orderId);

            return {
                success: true,
                message: 'Order deleted successfully',
            }
        } catch (error) {

            if (error instanceof OrderNotFoundException) {
                throw error;
            }
            throw new OrderDeletionException();
        }
    }
}
