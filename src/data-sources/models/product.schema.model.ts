import mongoose, { Document, Schema } from 'mongoose'

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

const producer = mongoose.model<IProducer>('Producer', producerSchema)

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
  producer: { type: producerSchema, required: true },
  producerId: { type: Schema.Types.ObjectId, ref: 'Producer' }
})
// Set productSchema unique indetifiers
productSchema.index({ vintage: 1, name: 1, producerId: 1 }, { unique: true })

const product = mongoose.model<IProduct>('Product', productSchema)


export { IProducer, IProduct, producer as Producer, product as Product }

