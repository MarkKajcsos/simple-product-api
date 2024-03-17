export const resolvers = {
  Query: {
    productById: (parent: any, args: any, { dataSources }: any, info: any) => {
        return dataSources.productService.getProductById(args.id)
    },
    productsByProducerId: (parent: any, args: any, { dataSources }: any, info: any) => {
        return dataSources.productService.getProductsByProducerId(args.id)
    }        
  },
  Mutation: {
    createProducts: async (parent: any, args: any, { dataSources }: any, info: any) => {
        return await dataSources.productService.createProducts(args.products)
    },
    updateProduct: async (parent: any, args: any, { dataSources }: any, info: any) => {
        return await dataSources.productService.updateProduct(args.product)
    },
    deleteProducts: async (parent: any, args: any, { dataSources }: any, info: any) => {
        return await dataSources.productService.deleteProducts(args.ids)
    }        
  }

}