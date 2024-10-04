import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsArray, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductItem {
    @IsNotEmpty()
    @IsInt()
    productId: number;

    @IsPositive()
    quantity: number;

    @IsInt()
    @IsPositive()
    price: number;
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductItem)
    @Column('jsonb')
    products: ProductItem[];

    @Column()
    @IsInt()
    totalAmount: number;
}
