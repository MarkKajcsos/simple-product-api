import { Product } from "../models";


export class ProductMockService {


    private dataset: Product[] = [
            {
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
            },        
            {
                _id: "2",
                vintage: "Pigy boy",
                name: "Stefan",
                producerId: "1",
                producer: {
                    _id: "1",
                    name: "Bodorkos",
                    country: "Hungay",
                    region: "Villany",
                }
            },
            {
                _id: "3",
                vintage: "Bobber",
                name: "Scretcher",
                producerId: "2",  
                producer: {
                    _id: "2",
                    name: "Puli",
                    country: "Hungay",
                    region: "Szekszard",
                }                      
            },
            {
                _id: "4",
                vintage: "Caffee racer",
                name: "BobbyRiderT",
                producerId: "2",   
                producer: {
                    _id: "2",
                    name: "Puli",
                    country: "Hungay",
                    region: "Szekszard",
                }                       
            }            
        ]

    products(): Product[] {
        return this.dataset
    }
    productByProducer(ids: string[]): Omit<Product, 'producer'>[] {
        return this.dataset.filter(product => ids.includes(product._id)).map(({producer, ...rest}) => rest)
    }

    product(id: string): Product | null {
        try {
            return this.dataset.find(product => product._id === id) ?? null
        } catch (error) {
            throw Error(`ProductMockService.product error: ${error}`)
        }
    }
    
}