import { model, Schema } from 'mongoose';
import { ProductService } from ".";
import { Product } from "../models";

/**
 * Create Product schema that compatible with mongodb datastructure
 */

// interface Product {
//     _id: string
//     vintage: string
//     name: string
//     producerId: string
//     // producer: ProducerModel   
// }

// interface ProductModel extends Product, Document {}

const productSchema: Schema = new Schema({
  _id: { type: String, required: true },
  vintage: { type: String, required: true },
  name: { type: String, required: true },
  producerId: { type: String, required: true }
//   vintage: { type: String, required: true }
});

// const ProductModel = model('Product', productSchema);

export class ProductMongodb implements ProductService {
    private dbProduct: any
    constructor(config: any){
        this.dbProduct = model('Product', productSchema)
    }

    products(): Product[] {
        const result = this.dbProduct.find()
        console.log(result)
        return [{
                _id: "1",
                vintage: "Pigy boy",
                name: "Stefan",
                producerId: "1",
                producer: {
                    _id: "1",
                    name: "Bodorkos",
                    country: "Hungay",
                    region: "Villany",
                }
            }]

    }
    product(id: string): Product | null {
        throw new Error("Method not implemented.");
    }
    productByProducer(ids: string[]): Omit<Product, "producer">[] {
        throw new Error("Method not implemented.");
    }

}