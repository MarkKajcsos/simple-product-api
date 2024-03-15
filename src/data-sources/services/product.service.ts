import { ProductModel } from "../models/product"


export interface ProductService {
    products(): ProductModel[]
    product(id: string): ProductModel | null
    productByProducer(ids: string[]): Omit<ProductModel, 'producer'>[]
}