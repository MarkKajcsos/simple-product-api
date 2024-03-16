import {
  ProductServiceMongodb
} from './data-sources/services'

export type ApplicationContext = {
  dataSources: {
    productService: ProductServiceMongodb
  }
}

export const getApplicationContext = (): ApplicationContext => {
  return {
    dataSources: {
      productService: new ProductServiceMongodb()
    },
  }
}
