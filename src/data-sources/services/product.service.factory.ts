import { ProductMockService, ProductService } from '.'
import { ProductMongodb } from './product.service.mongodb'

export class ProductServiceFactory {
  static getService(config: any): ProductService {
    if (config.app.datasources.product == 'mongodb') {
        return new ProductMongodb(config)
    } else {
        return new ProductMockService()
    }
  }
}
