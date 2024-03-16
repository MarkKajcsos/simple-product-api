import { Product } from "../models/product"


export interface ProductService {
    products(): Product[]
    product(id: string): Product | null
    productByProducer(ids: string[]): Omit<Product, 'producer'>[]
}