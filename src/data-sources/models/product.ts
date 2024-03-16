import { ProducerModel } from "."

export interface Product {
    _id: string
    vintage: string
    name: string
    producerId: string
    producer: ProducerModel   
}

