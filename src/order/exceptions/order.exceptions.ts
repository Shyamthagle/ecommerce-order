import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Order with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class EntityNotFoundException extends HttpException {
    constructor(entityName: string, id: number) {
        super(`${entityName} with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class OrderCreationException extends HttpException {
    constructor() {
        super('Failed to create order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class OrderUpdateException extends HttpException {
    constructor() {
        super('Failed to update order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class OrderDeletionException extends HttpException {
    constructor() {
        super('Failed to delete order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class NoFieldsProvidedException extends HttpException {
    constructor() {
        super('No fields provided for update', HttpStatus.BAD_REQUEST);
    }
}
