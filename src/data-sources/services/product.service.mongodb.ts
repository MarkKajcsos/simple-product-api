/* eslint-disable @typescript-eslint/naming-convention */
import logger from '../../utils/logger'
import { IProduct, Producer, Product } from '../models/product.schema.model'
import { IProductService } from './product.service'



export class ProductServiceMongodb implements IProductService<IProduct> {

  /**
   * Save single Product with containing Producer item.
   *
   * @param product 
   * @returns Created product items.
   */
  public async upsertProductAndProducer(product: any): Promise<IProduct> {
    try {
      // Upsert Producer item
      const producerFilter = { name: product.producer.name }
      const dbProducer = await Producer.findOneAndUpdate(
        producerFilter, product.producer, { upsert: true, returnDocument: 'after' }
      )
      logger.debug(`New Producer stored in db: ${dbProducer}`)

      // // Upsert Product item
      product.producer = dbProducer._id // product.producer field is ObjectId type
      const productFilter = { name: product.name, vintage: product.vintage, producerId: dbProducer?._id }
      const updateProduct = { ...product, producerId: dbProducer._id }
      const dbProduct = await Product.findOneAndUpdate(
        productFilter, updateProduct, { upsert: true, returnDocument: 'after' }
      )

      logger.debug(`New Product stored in db: ${dbProduct}`)
            
      const productWithProducer = await Product.findById(dbProduct._id).populate('producer')
      return productWithProducer!
    } catch (error) {
      throw new Error(`ProductServiceMongodb.upsertProductAndProducer failed: ${error}`)
    }         
  }

  /**
   * Save Product items.
   *
   * @param products 
   * @returns Created product items.
   */
  public async createProducts(products: any[]): Promise<any[]> {
    try {      
      const results: any[] = []
      for(const item of products){
        const newItem = await this.upsertProductAndProducer(item)
        results.push(newItem)
      }
      return results
    } catch (error) {
      throw new Error(`ProductServiceMongodb.createProducts failed: ${error}`)
    }      
  }

  /**    
   * NOTE: This function is not used with the current setup
   * Function created to save Product items by session to ensure
   * the transaction if every items stored successfully .
   *
   * @param products 
   * @returns Products Created products from db.
   */
  async createProductsBySession(products: IProduct[]): Promise<IProduct[]> {
    // Start a session
    const session = await Producer.startSession()
    const result: IProduct[] = []
    try {
      // Start a transaction
      await session.startTransaction()
        
      for(const product of products){
        // Create new Producer item
        const newProducer = await Producer.create([product.producer], { session }) // Create a child object

        // Set Product item with proper 'producerId' and 'Producer' fields
        const newProduct = { 
          ...product,
          producerId: newProducer[0]._id,
          // producer: newProducer
        }

        // Create new Product item
        const createProduct = await Product.create([newProduct], { session })
        result.push(createProduct[0])
      }

      // Commit the transaction if everything succeeds
      await session.commitTransaction()
        
      return result
    } catch (error) {
      await session.abortTransaction()
      throw new Error(`ProductServiceMongodb.createProducts: ${error}`)
    } finally {
      session.endSession()
    }
  }

  /**
   * Get simple Product by id.
   *
   * @param id 
   * @returns Product.
   */
  async getProductById(id: string): Promise<IProduct | null> { 
    try {
      return await Product.findById(id).populate('producer')
    } catch (error) {
      throw new Error(`ProductServiceMongodb.getProductById failed: ${error}`)
    }     

}

  /**
   * Get simple Producer by id.
   *
   * @param id 
   * @returns Producer.
   */
  async getProducerById(id: string): Promise<IProduct | null> { 
    try {
      return await Producer.findById(id)
    } catch (error) {
      throw new Error(`ProductServiceMongodb.getProducerById failed: ${error}`)
    }     

  }

  /**
   * Get list of Product filtered by 'producerId'.
   * Doesn't need to attach the producer doc to product.producer field.
   *
   * @param producerId 
   * @returns Product[].
   */
  async getProductsByProducerId(producerId: string): Promise<IProduct[]> {
    try {
      return await Product.find({ producerId }).populate('producer')
    } catch (error) {
      throw new Error(`ProductServiceMongodb.getProductsByProducerId failed: ${error}`)
    }  
  }

  /**
   * Update Product related Producer.
   * Assumed that -> client attach the _id field of product and producer.
   * If product with given _id not exists then current function doesn't create new doc, but return null.
   *
   * @param product 
   * @returns 
   */
  async updateProduct(product: IProduct): Promise<IProduct | null> {
    try {
      // Find and update producer item (in 'producers' collection )
      await Producer.findByIdAndUpdate(product.producerId, product.producer, { returnDocument: 'after' })
      // Find and update product
      const updatedProduct = await Product.findByIdAndUpdate(product._id, product, { returnDocument: 'after' })
      return updatedProduct ? updatedProduct?.populate('producer') : null
    } catch (error) {
      throw new Error(`ProductServiceMongodb.updateProduct failed: ${error}`)
    }  
  }

  /**
   * Delete Products and Producers by Product' ids.
   *
   * @param ids 
   * @returns Success: boolean, deleteCount: number.
   */
  async deleteProducts(ids: string[]): Promise<{success: boolean; deleteCount: number}> {
    try {
      // Get producers' id
      const products = await Product.find({ _id:{ $in:ids } })    
      const producerIds = products.map(product => product.producerId.toString())
      logger.debug(producerIds)

      // Delete Products by ids argument
      const deleteResult = await Product.deleteMany({ _id:{ $in:ids } })

      // Delete Producers by producerIds if there aren't reference from 'products' collection
      for(const id of producerIds){
        const products = await Product.find({ producerId: id })         
        logger.debug(id) 
        logger.debug(products) 
        if(products != null && products.length === 0){
          logger.debug(`No more prodod with producerId: ${id}`) 
          await Producer.deleteOne({ id })
        }
      }
      const result = { success: deleteResult.acknowledged, deleteCount: deleteResult.deletedCount }
      logger.debug(result)
      return result
    } catch (error) {
      throw new Error(`ProductServiceMongodb.deleteProducts failed: ${error}`)
    }  
  }    


}