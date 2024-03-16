export const resolvers = {
  Query: {
    products: (parent: any, args: any, { dataSources }: any, info: any)  => {        
        try {
            return  dataSources.productService.products()
        } catch (error) {
            throw error           
        }
    },
    product: (parent: any, args: any, { dataSources }: any, info: any) => {
        try {
            return dataSources.productService.product(args.id)
        } catch (error) {
            throw error           
        }
    }    
  },

}