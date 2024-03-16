import { gql } from 'graphql-modules'

export const typeDefs = gql`
    type Producer {
        _id: String!
        name: String!
        country: String
        region: String
    }

    input ProducerInput {
        _id: String!
        name: String!
        country: String
        region: String
    }    
`
