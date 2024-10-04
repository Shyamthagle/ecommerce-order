import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { Order } from './entity/order.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    OrderNotFoundException,
    OrderCreationException,
    OrderUpdateException,
    OrderDeletionException,
    NoFieldsProvidedException,
} from './exceptions/order.exceptions';

describe('OrderService', () => {
    let orderService: OrderService;
    let orderRepository: Repository<Order>;

    const mockOrderRepository = {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockOrderRepository,
                },
            ],
        }).compile();

        orderService = module.get<OrderService>(OrderService);
        orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    });

    it('should be defined', () => {
        expect(orderService).toBeDefined();
    });

    describe('createOrder', () => {
        it('should create an order successfully', async () => {
            const orderItems = new Order(); // Add necessary properties if any
            const savedOrder = { ...orderItems, id: 1 }; // Mock saved order with an ID
            
            mockOrderRepository.save.mockResolvedValue(savedOrder);

            const result = await orderService.createOrder(orderItems);

            expect(result).toEqual({
                success: true,
                message: 'Order created successfully',
                data: savedOrder,
            });
            expect(mockOrderRepository.save).toHaveBeenCalledWith(orderItems);
        });

        it('should throw OrderCreationException on error', async () => {
            const orderItems = new Order();

            mockOrderRepository.save.mockRejectedValue(new Error('DB error'));

            await expect(orderService.createOrder(orderItems)).rejects.toThrow(OrderCreationException);
        });
    });

    describe('getOrders', () => {
        it('should return an array of orders successfully', async () => {
            const orders = [new Order(), new Order()]; // Add necessary properties if any
            mockOrderRepository.find.mockResolvedValue(orders);

            const result = await orderService.getOrders();

            expect(result).toEqual({
                success: true,
                message: 'Orders retrieved successfully',
                data: orders,
            });
            expect(mockOrderRepository.find).toHaveBeenCalled();
        });

        it('should throw an error on exception', async () => {
            mockOrderRepository.find.mockRejectedValue(new Error('DB error'));

            await expect(orderService.getOrders()).rejects.toThrow(Error);
        });
    });

    describe('getProductById', () => {
        it('should return an order successfully', async () => {
            const orderId = 1;
            const order = new Order(); // Add necessary properties if any
            mockOrderRepository.findOne.mockResolvedValue(order);

            const result = await orderService.getProductById(orderId);

            expect(result).toEqual({
                success: true,
                message: 'Order retrieved successfully',
                data: order,
            });
            expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: orderId } });
        });

        it('should throw OrderNotFoundException when order does not exist', async () => {
            const orderId = 1;
            mockOrderRepository.findOne.mockResolvedValue(null);

            await expect(orderService.getProductById(orderId)).rejects.toThrow(OrderNotFoundException);
        });
    });

    describe('updateOrder', () => {
        it('should update an order successfully', async () => {
            const orderId = 1;
            const order = { /* partial order data */ };
            const existingOrder = new Order(); // Mock existing order

            mockOrderRepository.findOne.mockResolvedValue(existingOrder);
            mockOrderRepository.update.mockResolvedValue({});
            mockOrderRepository.findOne.mockResolvedValue({ ...existingOrder, ...order });

            const result = await orderService.updateOrder(orderId, order);

            expect(result).toEqual({
                success: true,
                message: 'Order updated successfully',
                data: { ...existingOrder, ...order },
            });
            expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: orderId } });
            expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, order);
        });

        it('should throw OrderNotFoundException when order does not exist', async () => {
            const orderId = 1;
            const order = { /* partial order data */ };

            mockOrderRepository.findOne.mockResolvedValue(null);

            await expect(orderService.updateOrder(orderId, order)).rejects.toThrow(OrderNotFoundException);
        });

        it('should throw NoFieldsProvidedException when no fields are provided', async () => {
            const orderId = 1;
            const order = {};

            mockOrderRepository.findOne.mockResolvedValue(new Order());

            await expect(orderService.updateOrder(orderId, order)).rejects.toThrow(NoFieldsProvidedException);
        });

        it('should throw OrderUpdateException on error', async () => {
            const orderId = 1;
            const order = { /* partial order data */ };

            mockOrderRepository.findOne.mockResolvedValue(new Order());
            mockOrderRepository.update.mockRejectedValue(new Error('DB error'));

            await expect(orderService.updateOrder(orderId, order)).rejects.toThrow(OrderUpdateException);
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order successfully', async () => {
            const orderId = 1;
            const existingOrder = new Order(); // Mock existing order

            mockOrderRepository.findOne.mockResolvedValue(existingOrder);
            mockOrderRepository.delete.mockResolvedValue({});

            const result = await orderService.deleteOrder(orderId);

            expect(result).toEqual({
                success: true,
                message: 'Order deleted successfully',
            });
            expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: orderId } });
            expect(mockOrderRepository.delete).toHaveBeenCalledWith(orderId);
        });

        it('should throw OrderNotFoundException when order does not exist', async () => {
            const orderId = 1;

            mockOrderRepository.findOne.mockResolvedValue(null);

            await expect(orderService.deleteOrder(orderId)).rejects.toThrow(OrderNotFoundException);
        });

        it('should throw OrderDeletionException on error', async () => {
            const orderId = 1;
            const existingOrder = new Order();

            mockOrderRepository.findOne.mockResolvedValue(existingOrder);
            mockOrderRepository.delete.mockRejectedValue(new Error('DB error'));

            await expect(orderService.deleteOrder(orderId)).rejects.toThrow(OrderDeletionException);
        });
    });
});
