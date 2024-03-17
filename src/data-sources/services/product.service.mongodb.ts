import mongoose, { Document, Schema } from 'mongoose';

// Define the Producer schema
interface IProducer extends Document {
  name: string
  country: string
  region: string
}

const producerSchema = new Schema<IProducer>({
  name: { type: String, required: true },
  country: { type: String, required: false },
  region: { type: String, required: false }
})

const Producer = mongoose.model<IProducer>('Producer', producerSchema);

// Define the Product schema
interface IProduct extends Document {
  name: string
  vintage: string
  producer: IProducer
  producerId: mongoose.Types.ObjectId
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  vintage: { type: String, required: true },
  producer: { type: producerSchema, required: true},
  producerId: mongoose.Types.ObjectId
});

const Product = mongoose.model<IProduct>('Product', productSchema);



export class ProductServiceMongodb {

    async isProducerExist(producer: IProducer): Promise<string | null> {
      try {
        const dbItem = await Producer.findOne({
          name: producer.name,
          country: producer.country,
          region: producer.region
        })
        return dbItem?._id ?? null
      } catch (error) {
        throw new Error(`ProductServiceMongodb.getProductsByProducerId failed: ${error}`)
      }  
    }

    /**
     * Save single Product with containing Producer item
     * @param product 
     * @returns Created product items
     */
    async createProduct(product: IProduct): Promise<IProduct> {
      try {
        // Create new Producer item
        const newProducer = await Producer.create(product.producer); // Create a child object

        // Set Product item with proper 'producerId' and 'Producer' fields
        const newProduct = { 
          ...product,
          producerId: newProducer._id,
          producer: newProducer
        }

        // Create new Product item
        const productDoc = await Product.create(newProduct);
        console.log(productDoc);
        return productDoc
      } catch (error) {
        throw new Error(`ProductServiceMongodb.createProduct failed: Transaction aborted: ${error}`)
      }         
    }

    /**
     * Save Product items
     * @param products 
     * @returns Created product items
     */
    async createProducts(products: IProduct[]): Promise<IProduct[]> {
      try {      
        var results: any[] = []
        for(let item of products){
          const newItem = await this.createProduct(item)
          results.push(newItem)
        }
        return results
      } catch (error) {
        throw new Error(`ProductServiceMongodb.createProducts failed: Transaction aborted: ${error}`)
      }      
    }

    /**    
     * -- NOTE: This function is not used with the current setup --
     * Function created to save Product items by session to ensure
     * the transaction if every items stored successfully 
     * @param products 
     * @returns products Created products from db
     */
    async createProductsBySession(products: IProduct[]): Promise<IProduct[]> {
      // Start a session
      const session = await Producer.startSession();
      let result: IProduct[] = []
      try {
        // Start a transaction
        await session.startTransaction();
        
        for(let product of products){
          // Create new Producer item
          const newProducer = await Producer.create([product.producer], {session}); // Create a child object

          // Set Product item with proper 'producerId' and 'Producer' fields
          const newProduct = { 
            ...product,
            producerId: newProducer[0]._id,
            producer: newProducer
          }

          // Create new Product item
          const createProduct = await Product.create([newProduct], {session});
          result.push(createProduct[0])
        }

        // Commit the transaction if everything succeeds
        await session.commitTransaction();
        
        
      } catch (error) {
        await session.abortTransaction();
        throw new Error(`ProductServiceMongodb.createProducts: Transaction aborted: ${error}`)
      } finally {
        session.endSession();
        return result
      }


    }

    /**
     * Get simple Product by id
     * @param id 
     * @returns Product
     */
    async getProductById(id: string): Promise<IProduct | null> { 
      try {
        return await Product.findById(id)
      } catch (error) {
        throw new Error(`ProductServiceMongodb.getProductById failed: ${error}`)
      }     

    }

    /**
     * Get list of Product filtered by 'producerId'
     * @param producerId 
     * @returns Product[]
     */
    async getProductsByProducerId(producerId: string): Promise<IProduct[]> {
      try {
        return await Product.find({producerId})
      } catch (error) {
        throw new Error(`ProductServiceMongodb.getProductsByProducerId failed: ${error}`)
      }  
    }

    // async updateProduct(product: IProduct): Promise<IProduct[]> {
    //   try {
    //     const uupdatedProduct = await Product.findByIdAndUpdate([product])
    //   } catch (error) {
    //     throw new Error(`ProductServiceMongodb.getProductsByProducerId failed: ${error}`)
    //   }  
    // }

    // async deleteProducts(ids: string[]): Promise<boolean> {

    // }    

}