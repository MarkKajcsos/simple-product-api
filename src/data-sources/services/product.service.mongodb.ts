/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from 'mongoose'
import { IProducer, IProduct, Producer, Product } from '../../model/product.schema.model'
import logger from '../../utils/logger'
import { IProductService } from './product.service'


export class ProductServiceMongodb implements IProductService<IProduct> {

  /**
   * Save single Product with containing Producer item.
   *
   * @param product 
   * @returns Created product items.
   */
  public async upsertProductAndProducer(product: IProduct): Promise<IProduct> {
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
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.upsertProductAndProducer failed: ${error.message}`
      }
      throw error
    }         
  }

  /**
   * Save Product items.
   *
   * @param products 
   * @returns Created product items.
   */
  public async createProducts(products: IProduct[]): Promise<IProduct[]> {
    try {      
      

      // Get producers out of products (unique list)
      const producers =  [...new Set(products.map((product: IProduct) => product.producer))]
      const producerNames  = [...new Set(producers.map((producer: IProducer) => producer.name))]
      const productNames  = products.map((product: IProduct) => product.name)

      // Upsert producers
      const producerBulkOperations: any[] = producers.map((producer: IProducer) => {return {
        findOneAndUpdate: {
          filter: { name: producer.name }, 
          update: producer,
          options: { upsert: true, returnDocument: 'after' }
        }
      }})
      await Producer.bulkWrite(producerBulkOperations)

      // Get upserted producers' id-name dictionary
      const upsertedProducers = await Producer.find({ name: { $in: producerNames } },  { name: 1, _id: 1 })
      const producerNameId: { [key: string]: mongoose.Types.ObjectId } = upsertedProducers.reduce((acc: any, current) => {
        acc[current.name] = current._id
        return acc
      }, {})    


      // Set products' producerId filed
      products.map((product: IProduct) => {product.producerId = producerNameId[product.producer.name]})

      // Upsert products
      const productBulkOperations: any[] = products.map((product: IProduct) => {return {
        findOneAndUpdate: {
          filter: { name: product.name, vintage: product.vintage, producerId: product.producerId }, // product identifiers
          update: product,
          options: { upsert: true, returnDocument: 'after' }
        }
      }})
      const productUpsertResult = await Product.bulkWrite(productBulkOperations)
      const upsertedProductIds: string[] = Object.values(productUpsertResult.upsertedIds)

      // Get upserted products
      const results: IProduct[] = await Product.find({ _id:{ $in:upsertedProductIds } })
      return results
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.createProducts failed: ${error.message}`
      }
      throw error
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
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.getProductById failed: ${error.message}`
      }
      throw error
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
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.getProducerById failed: ${error.message}`
      }
      throw error
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
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.getProductsByProducerId failed: ${error.message}`
      }
      throw error
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
      // Find and update product
      const updatedProduct = await Product.findByIdAndUpdate(product._id, product, { returnDocument: 'after' })
      return updatedProduct ? updatedProduct?.populate('producer') : null
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.updateProduct failed: ${error.message}`
      }
      throw error
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
      // Delete Products by ids argument
      const deleteResult = await Product.deleteMany({ _id:{ $in:ids } })
      const result = { success: deleteResult.acknowledged, deleteCount: deleteResult.deletedCount }
      logger.debug(result)
      return result
    } catch (error: any) {
      if(error.message){
        error.message = `ProductServiceMongodb.deleteProducts failed: ${error.message}`
      }
      throw error
    }
  }
}