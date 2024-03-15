import {
  ProductMockService,
  ProductService
} from './data-sources/services'

export type ApplicationContext = {
  dataSources: {
    productService: ProductService
  }
}

export class ApplicationContextFactory {
  // TODO - change config type to Config
  static getApplicationContext(config: any): ApplicationContext {
    return {
      dataSources: {
        productService: new ProductMockService(),
        // productService: ProductServiceFactory.getService(config),
      },
    }
  }
}
