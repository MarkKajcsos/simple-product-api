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

  input ProductCreateInput {
    vintage: String!
    name: String!
    producer: ProducerInput!
  }

  input ProductUpdateInput {
    _id: ID!
    vintage: String!
    name: String!
    producerId: String!
    producer: ProducerInput!
  }  

  type DeletionResult {
    success: Boolean!
    deleteCount: Int!
  }  

  type Query {
    productById(id: ID!): Product
    productsByProducerId(id: ID!): [ProductWithoutProducer]
  }

  type Mutation {
    createProducts(products: [ProductCreateInput!]): [Product]
    updateProduct(product: ProductUpdateInput!): Product
    deleteProducts(ids: [ID!]): DeletionResult!
    startImport(): Boolean!
  }  
`