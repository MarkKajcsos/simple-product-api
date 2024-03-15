export const resolvers = {
  Query: {
    products: async (parent: any, args: any, context: any, info: any)  => {        
        try {
            return context.dataSources.productService.products()
        } catch (error) {
            throw error           
        }
    },
    product: (parent: any, args: any, context: any, info: any) => {
        try {
            console.log(args.id)
            return context.dataSources.productService.product(args.id)
        } catch (error) {
            throw error           
        }
    }    
  },
}