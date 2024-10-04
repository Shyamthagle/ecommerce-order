import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entity/order.entity';

describe('OrderController', () => {
    let orderController: OrderController;
    let orderService: OrderService;

    const mockOrderService = {
        createOrder: jest.fn((orderItems: Order) => Promise.resolve({ id: 1, ...orderItems })),
        getOrders: jest.fn(() => Promise.resolve([{ id: 1, items: [] }])),
        getProductById: jest.fn((id: number) => Promise.resolve({ id, items: [] })),
        updateOrder: jest.fn((id: number, order: Partial<Order>) => Promise.resolve({ id, ...order })),
        deleteOrder: jest.fn((id: number) => Promise.resolve({ success: true })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: mockOrderService,
                },
            ],
        }).compile();

        orderController = module.get<OrderController>(OrderController);
        orderService = module.get<OrderService>(OrderService);
    });

    it('should be defined', () => {
        expect(orderController).toBeDefined();
    });

    describe('createOrder', () => {
        it('should create an order', async () => {
            const orderItems: Order = {
                id: 1,
                products: [{ productId: 1, price: 50, quantity: 2 }],
                totalAmount: 100
            };
            const result = await orderController.createOrder(orderItems);
            expect(result).toEqual({ id: 1, ...orderItems });
            expect(orderService.createOrder).toHaveBeenCalledWith(orderItems);
        });
    });

    describe('getOrders', () => {
        it('should return an array of orders', async () => {
            const result = await orderController.getOrders();
            expect(result).toEqual([{ id: 1, items: [] }]);
            expect(orderService.getOrders).toHaveBeenCalled();
        });
    });

    describe('getProductById', () => {
        it('should return a single order by id', async () => {
            const id = 1;
            const result = await orderController.getProductById(id);
            expect(result).toEqual({ id, items: [] });
            expect(orderService.getProductById).toHaveBeenCalledWith(id);
        });
    });

    describe('updateOrder', () => {
        it('should update an order', async () => {
            const id = 1;
            const order: Partial<Order> = { /* Mock updated order data */ };
            const result = await orderController.updateOrder(id, order);
            expect(result).toEqual({ id, ...order });
            expect(orderService.updateOrder).toHaveBeenCalledWith(id, order);
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order and return success response', async () => {
            const id = 1;
            const result = await orderController.deleteOrder(id);
            expect(result).toEqual({ success: true });
            expect(orderService.deleteOrder).toHaveBeenCalledWith(id);
        });
    });
});
