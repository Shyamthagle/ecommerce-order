import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { Order } from './entity/order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
    OrderNotFoundException,
    OrderCreationException,
    OrderUpdateException,
    OrderDeletionException,
    NoFieldsProvidedException,
} from './exceptions/order.exceptions';

const mockOrder: Order = {
    id: 1,
    products: [{ productId: 1, quantity: 2, price: 100 }],
    totalAmount: 200,
};

const mockOrderRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('OrderService', () => {
    let orderService: OrderService;
    let orderRepository: Repository<Order>;
    let cacheManager: Cache;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockOrderRepository,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                        del: jest.fn(),
                    },
                },
            ],
        }).compile();

        orderService = module.get<OrderService>(OrderService);
        orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
        cacheManager = module.get<Cache>(CACHE_MANAGER);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an order successfully', async () => {
        mockOrderRepository.save.mockResolvedValue(mockOrder);
        const result = await orderService.createOrder(mockOrder);

        expect(result).toEqual({
            success: true,
            message: 'Order created successfully',
            data: mockOrder,
        });
    });

    it('should throw OrderCreationException on failure', async () => {
        mockOrderRepository.save.mockRejectedValue(new Error('Database error'));
        
        await expect(orderService.createOrder(mockOrder)).rejects.toThrow(OrderCreationException);
    });

    it('should retrieve orders successfully', async () => {
        mockOrderRepository.findAndCount.mockResolvedValue([[mockOrder], 1]);
        const result = await orderService.getOrders();

        expect(result).toEqual({
            success: true,
            message: 'Orders retrieved successfully',
            count: 1,
            data: [mockOrder],
        });
    });

    it('should throw an error on getOrders failure', async () => {
        mockOrderRepository.findAndCount.mockRejectedValue(new Error('Database error'));

        await expect(orderService.getOrders()).rejects.toThrow('Failed to retrieve orders: Database error');
    });

    it('should retrieve an order by ID successfully', async () => {
        mockOrderRepository.findOne.mockResolvedValue(mockOrder);
        const result = await orderService.getOrderById(1);

        expect(result).toEqual({
            success: true,
            message: 'Order retrieved successfully',
            data: mockOrder,
        });
    });

    it('should throw OrderNotFoundException if order not found', async () => {
        mockOrderRepository.findOne.mockResolvedValue(null);

        await expect(orderService.getOrderById(999)).rejects.toThrow(OrderNotFoundException);
    });

    it('should update an order successfully', async () => {
        mockOrderRepository.findOne.mockResolvedValue(mockOrder);
        mockOrderRepository.update.mockResolvedValue({});
        const updatedOrder = { ...mockOrder, totalAmount: 300 };
        
        const result = await orderService.updateOrder(1, { totalAmount: 300 });

        expect(result).toEqual({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder,
        });
    });

    it('should throw NoFieldsProvidedException if no fields provided', async () => {
        mockOrderRepository.findOne.mockResolvedValue(mockOrder);

        await expect(orderService.updateOrder(1, {})).rejects.toThrow(NoFieldsProvidedException);
    });

    it('should throw OrderNotFoundException if order to update does not exist', async () => {
        mockOrderRepository.findOne.mockResolvedValue(null);

        await expect(orderService.updateOrder(999, {})).rejects.toThrow(OrderNotFoundException);
    });

    it('should delete an order successfully', async () => {
        mockOrderRepository.findOne.mockResolvedValue(mockOrder);
        mockOrderRepository.delete.mockResolvedValue({});
        
        const result = await orderService.deleteOrder(1);

        expect(result).toEqual({
            success: true,
            message: 'Order deleted successfully',
        });
    });

    it('should throw OrderNotFoundException if order to delete does not exist', async () => {
        mockOrderRepository.findOne.mockResolvedValue(null);

        await expect(orderService.deleteOrder(999)).rejects.toThrow(OrderNotFoundException);
    });
});
