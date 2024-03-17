import { gql } from 'graphql-modules'

export const typeDefs = gql`
  type Product {
    _id: ID!
    vintage: String!
    name: String!
    producerId: String!
    producer: Producer!
  }

  type ProductWithoutProducer {
    _id: ID!
    vintage: String!
    name: String!
    producerId: String!
  }  

  input ProductInput {
    vintage: String!
    name: String!
    producer: ProducerInput!
  }

  type DeletionResult {
    success: Boolean!
    deletedCount: Int
    errors: [String]
  }  

  type Query {
    productById(id: ID!): Product
    productsByProducerId(id: ID!): [ProductWithoutProducer]
  }

  type Mutation {
    createProducts(products: [ProductInput!]): [Product]
    updateProduct(product: ProductInput): Product
    deleteProducts(ids: [ID!]): DeletionResult!
  }  
`