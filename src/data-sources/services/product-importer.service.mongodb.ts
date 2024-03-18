/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */


import csvParser from 'csv-parser'
import https from 'https'
import { Transform } from 'stream'
import config from '../../utils/config'
import { Product } from '../models/product.schema.model'

// MongoDB batch size
const batchSize = 100
// Set url of product csv 
const fetchUrl = config.productCsvUrl


/**
 * Function to group data by Vintage + Product Name + Producer.
 * @param data
 * @returns void
 */
function groupData(data: any[]) {
  const groupedData: Record<string, any[]> = {}
  data.forEach(item => {
    const key = `${item.Vintage}_${item['Product Name']}_${item.Producer}`
    if (!groupedData[key]) {
      groupedData[key] = []
    }
    groupedData[key].push(item)
  })
  return Object.values(groupedData)
}

/**
 * Stream transformer to batch data.
 */
class BatchTransformer extends Transform {
  private buffer: any[] = []

  constructor() {
    super({ objectMode: true })
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/ban-types
  _transform(chunk: any, encoding: string, callback: Function) {
    this.buffer.push(chunk)
    if (this.buffer.length >= batchSize) {
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

/**
 * Function to transform data structure to fit product/producer schema.
 * @param data
 * @returns void
 */
function transformData(data: any[]) {
  return data.map(item => {
    const newItem = {
      Vintage: item.Vintage,
      Name: item['Product Name'],
      producer: {
        name: item.Producer,
        country: item.Country,
        region: item.Region
      },
      Colour: item.Colour,
      Quantity: item.Quantity,
      Format: item.Format,
      'Price (GBP)': item['Price (GBP)'],
      Duty: item.Duty,
      Availability: item.Availability,
      Conditions: item.Conditions,
      ImageUrl: item.ImageUrl
    }
    return newItem
  })
}

/**
 * Main function to fetch CSV, process and upsert into MongoDB.
 */
export async function productSyncronization(): Promise<boolean> {
  return new Promise<boolean>(() => {
    try {
      https.get(fetchUrl, response => {
        response
          .pipe(csvParser())
          .pipe(new BatchTransformer())
          .on('data', async (data: any[]) => {
            const transformedData = transformData(data)
            const groupedData = groupData(transformedData)
            const bulkOps = groupedData.map(product => ({
              updateMany: {
                filter: { },
                update: { $set: { } },
                upsert: true
              }
            }))
            console.log(groupedData)
            await Product.bulkWrite(bulkOps)
          })
          .on('end', () => {
            console.log('CSV processing completed')
          })
          .on('error', (err) => {
            console.error('Error processing CSV:', err)
          })
      })  
    } catch (error) {
      console.error(`Error occured during product data import ${error}`)
    }
  })
}
