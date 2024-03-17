export const resolvers = {
  Query: {
    productById: (parent: any, args: any, { dataSources }: any, info: any) => {
        try {
            return dataSources.productService.getProductById(args.id)
        } catch (error) {
            throw error           
        }
    },
    productsByProducerId: (parent: any, args: any, { dataSources }: any, info: any) => {
        try {
            return dataSources.productService.getProductsByProducerId(args.id)
        } catch (error) {
            throw error           
        }
    }        
  },
  Mutation: {
    createProducts: async (parent: any, args: any, { dataSources }: any, info: any) => {
        return await dataSources.productService.createProducts(args.products)
    }
  }

}