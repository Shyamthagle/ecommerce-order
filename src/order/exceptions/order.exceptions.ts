import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Order with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class OrderCreationException extends HttpException {
    constructor(message: string) {
        super(`Failed to create order: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class OrderUpdateException extends HttpException {
    constructor(message: string) {
        super(`Failed to update order: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class OrderDeletionException extends HttpException {
    constructor(message: string) {
        super(`Failed to delete order: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class NoFieldsProvidedException extends HttpException {
    constructor() {
        super('No fields provided for update', HttpStatus.BAD_REQUEST);
    }
}
