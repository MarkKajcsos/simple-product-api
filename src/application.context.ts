import {
  ProductImporter,
  ProductServiceMongodb
} from './data-sources/services'

export type ApplicationContext = {
  dataSources: {
    productService: ProductServiceMongodb
    productImporter: ProductImporter
  }
}

/**
 * 
 * @returns Initialize application context that will be used in grapqh.
 */
export const getApplicationContext = (): ApplicationContext => {
  return {
    dataSources: {
      productService: new ProductServiceMongodb(),
      productImporter: new ProductImporter()
    },
  }
}
