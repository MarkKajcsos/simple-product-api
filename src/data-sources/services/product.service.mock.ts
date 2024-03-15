import { ProductService } from ".";
import { ProductModel } from "../models";


export class ProductMockService implements ProductService {


    private dataset: ProductModel[] = [
            {
                _id: "1",
                vintage: "Pigy boy",
                name: "Stefan",
                producerId: "1",
                producer: {
                    _id: "12",
                    name: "Bodorkos",
                    country: "Hungay",
                    region: "Villany",
                }
            },        
            {
                _id: "Puch",
                vintage: "Pigy boy",
                name: "Stefan",
                producerId: "1",
                producer: {
                    _id: "12",
                    name: "Bodorkos",
                    country: "Hungay",
                    region: "Villany",
                }
            },
            {
                _id: "Yamaha",
                vintage: "Bobber",
                name: "Scretcher",
                producerId: "2",  
                producer: {
                    _id: "13",
                    name: "Puli",
                    country: "Hungay",
                    region: "Szekszard",
                }                      
            },
            {
                _id: "Honda",
                vintage: "Caffee racer",
                name: "BobbyRiderT",
                producerId: "2",   
                producer: {
                    _id: "13",
                    name: "Puli",
                    country: "Hungay",
                    region: "Szekszard",
                }                       
            }            
        ]

    products(): ProductModel[] {
        return this.dataset
    }
    productByProducer(ids: string[]): Omit<ProductModel, 'producer'>[] {
        return this.dataset.filter(product => ids.includes(product._id)).map(({producer, ...rest}) => rest)
    }

    product(id: string): ProductModel | null {
        try {
            return this.dataset.find(product => product._id === id) ?? null
        } catch (error) {
            throw Error(`ProductMockService.product error: ${error}`)
        }
    }
    
}