import mongoose, { Schema } from 'mongoose';
// import { Product } from "../models";

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

const producerSchema: Schema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  country: { type: String, required: false },
  region: { type: String, required: false }
});
const Producer = mongoose.model('Producer', producerSchema);

const productSchema = new Schema({
  _id: { type: String, required: true },
  vintage: { type: String, required: true },
  name: { type: String, required: true },
  producerId: { type: String, required: true },    
  producer: {
    type: mongoose.Schema.Types.ObjectId ,
    ref: 'Producer'
  }
});
const Product = mongoose.model('Product', productSchema);


export class ProductServiceMongodb {

    async products(): Promise<any> {
        const items = await Product.find()
        const itemObj = items.map(item => item.toObject());
        console.log(itemObj)
        return itemObj
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

    async product(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async productByProducer(ids: string[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

}