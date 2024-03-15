import { ProductService } from ".";
import { ProductModel } from "../models";

export class ProductMongodb implements ProductService {

    constructor(config: any){}

    products(): ProductModel[] {
        throw new Error("Method not implemented.");
    }
    product(id: string): ProductModel | null {
        throw new Error("Method not implemented.");
    }
    productByProducer(ids: string[]): Omit<ProductModel, "producer">[] {
        throw new Error("Method not implemented.");
    }

}