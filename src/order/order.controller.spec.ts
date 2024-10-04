import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entity/order.entity';
import { DeleteResponse, OrderResponse } from './interface/order.interface';
import { OrderNotFoundException } from './exceptions/order.exceptions';

const mockOrder: Order = {
  id: 1,
  products: [{ productId: 1, quantity: 2, price: 100 }],
  totalAmount: 200,
};

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            getOrders: jest.fn(),
            getOrderById: jest.fn(),
            updateOrder: jest.fn(),
            deleteOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order', async () => {
    orderService.createOrder = jest.fn().mockResolvedValue({
      success: true,
      message: 'Order created successfully',
      data: mockOrder,
    });

    const result = await orderController.createOrder(mockOrder);

    expect(result).toEqual({
      success: true,
      message: 'Order created successfully',
      data: mockOrder,
    });
  });

  it('should get all orders', async () => {
    orderService.getOrders = jest.fn().mockResolvedValue({
      success: true,
      message: 'Orders retrieved successfully',
      count: 1,
      data: [mockOrder],
    });

    const result = await orderController.getOrders();

    expect(result).toEqual({
      success: true,
      message: 'Orders retrieved successfully',
      count: 1,
      data: [mockOrder],
    });
  });

  it('should get an order by ID', async () => {
    orderService.getOrderById = jest.fn().mockResolvedValue({
      success: true,
      message: 'Order retrieved successfully',
      data: mockOrder,
    });

    const result = await orderController.getOrderById(1);

    expect(result).toEqual({
      success: true,
      message: 'Order retrieved successfully',
      data: mockOrder,
    });
  });

  it('should throw OrderNotFoundException when order not found', async () => {
    orderService.getOrderById = jest.fn().mockRejectedValue(new OrderNotFoundException(999));

    await expect(orderController.getOrderById(999)).rejects.toThrow(OrderNotFoundException);
  });

  it('should update an order', async () => {
    orderService.updateOrder = jest.fn().mockResolvedValue({
      success: true,
      message: 'Order updated successfully',
      data: mockOrder,
    });

    const result = await orderController.updateOrder(1, { totalAmount: 300 });

    expect(result).toEqual({
      success: true,
      message: 'Order updated successfully',
      data: mockOrder,
    });
  });

  it('should delete an order', async () => {
    orderService.deleteOrder = jest.fn().mockResolvedValue({
      success: true,
      message: 'Order deleted successfully',
    });

    const result = await orderController.deleteOrder(1);

    expect(result).toEqual({
      success: true,
      message: 'Order deleted successfully',
    });
  });
});
