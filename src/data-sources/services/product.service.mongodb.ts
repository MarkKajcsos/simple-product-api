import mongoose, { Document, Schema } from 'mongoose';

// Define the Producer interface, schema and model
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

// Define the Product interface, schema and model
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
  producerId: { type: Schema.Types.ObjectId, ref: 'Producer' }
});
// Set productSchema unique indetifiers
productSchema.index({ vintage: 1, name: 1, producerId: 1 }, { unique: true });

const Product = mongoose.model<IProduct>('Product', productSchema);


interface IProductService<T> {
  upsertProductAndProducer(product: T): Promise<T>
  createProducts(products: T[]): Promise<T[]>
  createProductsBySession(products: T[]): Promise<T[]>
  getProductById(id: string): Promise<T | null>
  getProductsByProducerId(producerId: string): Promise<T[]>
  updateProduct(product: T): Promise<T | null>
  deleteProducts(ids: string[]): Promise<boolean | any>
}


export class ProductServiceMongodb implements IProductService<IProduct> {

   /**
   * Check Prouduct item existence based on unique identifiers
   * @param product
   * @returns Product | null
   */
    async isProductExist(product: IProduct): Promise<IProduct | null> {
      try {
        const dbProduct = await Product.findOne({
          name: product.name,
          vintage: product.vintage,
          producerName: product.name
        })
        return dbProduct
      } catch (error) {
        throw new Error(`ProductServiceMongodb.isProductExist failed: ${error}`)
      }
    }

    /**
     * Save single Product with containing Producer item
     * @param product 
     * @returns Created product items
     */
    async upsertProductAndProducer(product: IProduct): Promise<IProduct> {
      try {
        // Upsert Producer item (even the Product new, might producer data exists)
        const producerFilter = { name: product.producer.name }
        const dbProducer = await Producer.findOneAndUpdate(
          producerFilter, product.producer, { upsert: true, returnDocument: 'after' }
        )

        // Set Product item with updated 'producerId' and 'producer' fields

        
        // // Upsert Product item
        const productFilter = { name: product.name, vintage: product.vintage, producerId: dbProducer?._id }
        const updateProduct = { ...product, producerId: dbProducer._id, producer: dbProducer }
        const dbProduct = await Product.findOneAndUpdate(
          productFilter, updateProduct, {upsert: true, returnDocument: 'after'}
        )
        console.debug(dbProduct);
        return dbProduct
      } catch (error) {
        throw new Error(`ProductServiceMongodb.upsertProductAndProducer failed: ${error}`)
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
          const newItem = await this.upsertProductAndProducer(item)
          results.push(newItem)
        }
        return results
      } catch (error) {
        throw new Error(`ProductServiceMongodb.createProducts failed: ${error}`)
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
        throw new Error(`ProductServiceMongodb.createProducts: ${error}`)
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

    /**
     * Update Product related Producer
     * Id Product not exist then current function doesn't create item, but return null
     * @param product 
     * @returns 
     */
    async updateProduct(product: IProduct): Promise<IProduct | null> {
      try {
        // Find and update producer item (in 'producers' collection )
        await Producer.findByIdAndUpdate(product.producerId, product.producer, { returnDocument: 'after' })
        // Find and update product
        return await Product.findByIdAndUpdate(product._id, product, { returnDocument: 'after' })
      } catch (error) {
        throw new Error(`ProductServiceMongodb.updateProduct failed: ${error}`)
      }  
    }

    /**
     * Delete Products and Producers by Product' ids
     * @param ids 
     * @returns success: boolean, deleteCount: number
     */
    async deleteProducts(ids: string[]): Promise<{success: boolean, deleteCount: number}> {
      try {
        // Get producers' id
        const products = await Product.find({_id:{$in:ids}})    
        const producerIds = products.map(product => product.producerId.toString());
        console.debug(producerIds)

        // Delete Products by ids argument
        const deleteResult = await Product.deleteMany({_id:{$in:ids}})

        // Delete Producers by producerIds if there aren't reference from 'products' collection
        for(let id of producerIds){
          const products = await Product.find({producerI: id})
          if(products.length == 0){
            await Producer.deleteOne({id})
          }
        }
        const result = { success: deleteResult.acknowledged, deleteCount: deleteResult.deletedCount }
        console.debug(result)
        return result
      } catch (error) {
        throw new Error(`ProductServiceMongodb.deleteProducts failed: ${error}`)
      }  
    }    

}