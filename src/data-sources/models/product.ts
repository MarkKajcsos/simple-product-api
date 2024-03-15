import { ProducerModel } from "./producer"

export type ProductModel = {
    _id: string
    vintage: string
    name: string
    producerId: string
    producer: ProducerModel   
}

