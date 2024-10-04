export interface ProductItem {
    productId: number;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    products: ProductItem[];
    totalAmount: number;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    count?: number;
    data: Order | Order[]
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}
