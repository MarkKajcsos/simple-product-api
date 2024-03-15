import { gql } from 'graphql-modules'

export const typeDefs = gql`
  type Product {
    _id: ID!
    vintage: String!
    name: String!
    producerId: String!
    producer: Producer!
  }

  input ProductInput {
    vintage: String!
    name: String!
    producerId: String! 
    producer: ProducerInput!
  }

  type Query {
    products: [Product]
    product(id: String!): Product
    productByProducer(id: ID!): [Product]
  }

  type Mutation {
    createProducts(input: [ProductInput!]): [Product]
    updateProduct(input: ProductInput): Product
    deleteProducts(ids: [ID!]): [Product]
  }  
`