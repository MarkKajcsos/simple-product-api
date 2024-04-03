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
    super({ objectMode: true })
    this.productService = new ProductServiceMongodb()
  }

  /**
   * Function to group data by Vintage + Product Name + Producer.
   *
   * @param data
   * @returns Void.
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
   *
   * @param data
   * @returns Void.
   */
  private parseData(data: any[]) {
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

  // Transform data, make unique list and save
  async _write(chunk: any, encoding: any, callback: any) {
    try {
      // Execute data parsing and make unique list
      const products = this.parseData(chunk)
      const uniqueProducts = this.getUniqueProducts(products)
      // Store current batch of data
      await this.productService.createProducts(uniqueProducts)
      callback()
    } catch (error) {
      callback(error)
    }
  }
}

export class ProductImporter {
  private readonly batchSize: number
  private readonly fetchUrl: string
  private batchTransformer: BatchTransformer
  private productSaver: ProductSaver

  constructor(){
    this.batchSize = config.importer.batchSize
    this.fetchUrl = config.importer.productCsvUrl
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
   * Start Product importing from external source.
   *
   * @returns True immediately.
   */
  public async startImport(): Promise<boolean> {
    this.productSyncronization()  // async call
      .then(() => logger.info('Product data import finished'))
      .catch((reason: any) => logger.error('Product data import failed: ' + reason))
    return true
  }  

}