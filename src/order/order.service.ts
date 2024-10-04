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
import { Cache } from 'cache-manager';

@Injectable()
export class OrderService {
    private readonly cacheKey = 'allOrdersCache';

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async createOrder(orderItems: Order): Promise<OrderResponse> {
        try {
            const data = await this.orderRepository.save(orderItems);

            const cachedOrders: { data: Order[]; count: number } = await this.cacheManager.get(this.cacheKey);

            if (cachedOrders) {
                cachedOrders.data.push(data);
                cachedOrders.count += 1;
                await this.cacheManager.set(this.cacheKey, cachedOrders, 300000); // 5 minutes
            }

            return {
                success: true,
                message: 'Order created successfully',
                data: data,
            };
        } catch (error) {
            throw new OrderCreationException(error.message);
        }
    }

    async getOrders(): Promise<OrderResponse> {
        try {
            const cachedOrders: { data: Order[]; count: number } = await this.cacheManager.get(this.cacheKey);

            if (cachedOrders) {
                return {
                    success: true,
                    message: 'Orders retrieved successfully',
                    count: cachedOrders.count,
                    data: cachedOrders.data,
                };
            }

            const [data, count] = await this.orderRepository.findAndCount();

            await this.cacheManager.set(this.cacheKey, { data, count }, 300000); // 5 minutes

            return {
                success: true,
                message: 'Orders retrieved successfully',
                count: count,
                data: data,
            };
        } catch (error) {
            throw new Error(`Failed to retrieve orders: ${error.message}`);
        }
    }

    async getOrderById(orderId: number): Promise<OrderResponse> {
        const cacheKey = `order_${orderId}`;

        try {
            const cachedOrder: Order = await this.cacheManager.get<Order>(cacheKey);

            if (cachedOrder) {
                return {
                    success: true,
                    message: 'Order retrieved successfully',
                    data: cachedOrder,
                };
            }

            const data: Order = await this.orderRepository.findOne({ where: { id: orderId } });

            if (!data) {
                throw new OrderNotFoundException(orderId);
            }

            await this.cacheManager.set(cacheKey, data, 300000);

            return {
                success: true,
                message: 'Order retrieved successfully',
                data: data,
            };
        } catch (error) {
            if (error instanceof OrderNotFoundException) {
                throw error;
            }
            throw new OrderNotFoundException(orderId);
        }
    }

    async updateOrder(orderId: number, order: Partial<Order>): Promise<OrderResponse> {
        try {
            const existingOrder = await this.orderRepository.findOne({ where: { id: orderId } });

            // If the order does not exist, throw an OrderNotFoundException
            if (!existingOrder) {
                throw new OrderNotFoundException(orderId);
            }

            // If no fields are provided, throw a NoFieldsProvidedException
            if (Object.keys(order).length === 0) {
                throw new NoFieldsProvidedException();
            }

            // Update the order
            await this.orderRepository.update(orderId, order);

            // Fetch the updated order to return it
            const updatedOrder = await this.orderRepository.findOne({ where: { id: orderId } });

            // Invalidate the cache for the updated order
            await this.cacheManager.del(this.cacheKey);
            await this.cacheManager.del(`order_${orderId}`);

            return {
                success: true,
                message: 'Order updated successfully',
                data: updatedOrder,
            };
        } catch (error) {
            if (error instanceof NoFieldsProvidedException) {
                throw error;
            }
            throw new OrderUpdateException(error.message);
        }
    }

    async deleteOrder(orderId: number): Promise<DeleteResponse> {
        try {
            const existingOrder = await this.orderRepository.findOne({ where: { id: orderId } });

            if (!existingOrder) {
                throw new OrderNotFoundException(orderId);
            }

            await this.orderRepository.delete(orderId);

            await this.cacheManager.del(this.cacheKey);
            await this.cacheManager.del(`order_${orderId}`);

            return {
                success: true,
                message: 'Order deleted successfully',
            };
        } catch (error) {
            if (error instanceof OrderNotFoundException) {
                throw error;
            }
            throw new OrderDeletionException(error.message);
        }
    }
}
