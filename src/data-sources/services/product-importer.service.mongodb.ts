/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import csvParser from 'csv-parser'
import https from 'https'
import { Transform, Writable, pipeline } from 'stream'
import config from '../../utils/config'
import logger from '../../utils/logger'
import { ProductServiceMongodb } from './product.service.mongodb'


/**
 * Stream transformer to batch data.
 */
class BatchTransformer extends Transform {
  private buffer: any[] = []
  constructor(private batchSize: number = 100) {
    super({ objectMode: true })
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/ban-types
  _transform(chunk: any, encoding: string, callback: Function) {
    this.buffer.push(chunk)
    if (this.buffer.length >= this.batchSize) {
      this.push(this.buffer)
      this.buffer = []
    }
    callback()
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/ban-types
  _flush(callback: Function) {
    if (this.buffer.length > 0) {
      this.push(this.buffer)
    }
    callback()
  }
}

class ProductSaver extends Writable {
  private productService: ProductServiceMongodb

  constructor() {
    super({objectMode: true})
    this.productService = new ProductServiceMongodb()
  }

  /**
   * Function to group data by Vintage + Product Name + Producer.
   * @param data
   * @returns void
   */
  private getUniqueProducts(data: any[]) {
    const uniqueProducts: Record<string, any> = {}
    data.forEach(item => {
      const key = `${item.vintage}_${item.name}_${item.producer.name}`
      uniqueProducts[key] = item
    })
    return Object.values(uniqueProducts)
  }

  /**
   * Function to transform data structure to fit product/producer schema.
   * @param data
   * @returns void
   */
  private transformData(data: any[]) {
    return data.map(item => {
      const newItem = {
        vintage: item.Vintage,
        name: item['Product Name'],
        producer: {
          name: item.Producer,
          country: item.Country,
          region: item.Region
        }
      }
      return newItem
    })
  }

  // _write function is called when data is written to the stream
  async _write(chunk, encoding, callback) {
    try {
      // Execute the provided code
      const transformedData = this.transformData(chunk)
      const uniqueProducts = this.getUniqueProducts(transformedData)
      // Store current batch of data
      await this.productService.createProducts(uniqueProducts)
      // Signal that writing the data was successful
      callback()
    } catch (error) {
      // If an error occurs, signal that writing the data failed
      callback(error)
    }
  }

}

export class ProductImporter {
  private readonly batchSize: number
  private readonly fetchUrl: string
  private productService: ProductServiceMongodb
  private batchTransformer: BatchTransformer
  private productSaver: ProductSaver

  constructor(){
    this.batchSize = config.importer.batchSize
    this.fetchUrl = config.importer.productCsvUrl
    this.productService = new ProductServiceMongodb()
    this.batchTransformer = new BatchTransformer(this.batchSize)
    this.productSaver = new ProductSaver()
  }

  /**
   * Main function to fetch CSV, process and upsert into MongoDB.
   */
  private async productSyncronization(): Promise<boolean> {
    return new Promise<boolean>(() => {
      https.get(this.fetchUrl, response => {
        pipeline(
          response,
          csvParser(),
          this.batchTransformer,
          this.productSaver,
          (err) => {
            if (err) {
              logger.error('ProductSyncronization pipeline failed:', err)
            } else {
              logger.info('ProductSyncronization pipeline succeeded')
            }
          }          
        )
      })
    })
  }

  /**
   * Start Product importing from external source
   * @returns true immediately
   */
  public async startImport(): Promise<boolean> {
    try {
      this.productSyncronization() // async call
      return true
    } catch (error) {
      throw new Error(`ProductServiceMongodb.productSyncronization failed: ${error}`)
    }
  }  

}