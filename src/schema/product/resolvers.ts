export const resolvers = {
  // TOASK: Should use field provider or rather populate function on Product model.
  // producer: {
  //   producer: async (parent: any, args: any, { dataSources }: any) => {
  //     return await dataSources.productService.getProducerById(parent.producerId)
  //   },
  // },
  Query: {
    productById: async (parent: any, args: any, { dataSources }: any) => {
      return await dataSources.productService.getProductById(args.id)
    },
    productsByProducerId: async (parent: any, args: any, { dataSources }: any) => {
      return await dataSources.productService.getProductsByProducerId(args.id)
    }        
  },
  Mutation: {
    createProducts: async (parent: any, args: any, { dataSources }: any) => {
      return await dataSources.productService.createProducts(args.products)
    },
    updateProduct: async (parent: any, args: any, { dataSources }: any) => {
      return await dataSources.productService.updateProduct(args.product)
    },
    deleteProducts: async (parent: any, args: any, { dataSources }: any) => {
      return await dataSources.productService.deleteProducts(args.ids)
    },
    productSyncronization: async (parent: any, args: any, { dataSources }: any) => {
      return await dataSources.productImporter.startImport()
    }
  }

}