/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import csvParser from 'csv-parser'
import https from 'https'
import { Transform } from 'stream'
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


export class ProductImporter {
  private readonly batchSize: number
  private readonly fetchUrl: string
  private productService: ProductServiceMongodb

  constructor(){
    this.productService = new ProductServiceMongodb()
    this.batchSize = config.importer.batchSize
    this.fetchUrl = config.importer.productCsvUrl
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
      const newItem: any = {
        vintage: item.Vintage,
        name: item['Product Name'],
        producer: {
          name: item.Producer,
          country: item.Country,
          region: item.Region
        },
        colour: item.Colour,
        quantity: item.Quantity,
        format: item.Format,
        price_GBP: item['Price (GBP)'],
        duty: item.Duty,
        availability: item.Availability,
        conditions: item.Conditions,
        imageUrl: item.ImageUrl
      }
      return newItem
    })
  }

  /**
   * Main function to fetch CSV, process and upsert into MongoDB.
   */
  private async productSyncronization(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      https.get(this.fetchUrl, response => {
        let isProcessingCompleted = false;

        response.pipe(csvParser())
          .pipe(new BatchTransformer(this.batchSize))
          .on('data', async (data: any[]) => {
            if (!isProcessingCompleted) {
              // Temporarily pause the stream to handle backpressure
              response.pause();
              try {
                const transformedData = this.transformData(data);
                const uniqueProducts = this.getUniqueProducts(transformedData);
                // Store current batch of data
                await this.productService.createProducts(uniqueProducts);
                // Resume the stream after async operation
                response.resume()
              } catch (error) {
                isProcessingCompleted = true // Prevent further processing
                reject(error)
              }
            }
          })
          .on('end', () => {
            if (!isProcessingCompleted) {
              logger.info('CSV processing completed');
              resolve(true)
            }
          })
          .on('error', (err) => {
            logger.error('Error processing CSV:', err);
            reject(err)
          });
      }).on('error', (err) => {
        logger.error('HTTPS request error:', err);
        reject(err)
      });
    });
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