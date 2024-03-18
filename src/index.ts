// index.ts
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { getApplicationContext } from './application.context'
import { resolvers, typeDefs } from './schema'
import MongoDBClient from './utils/client/mongodb.client'
import config from './utils/config'



const app = express()
const dbClient = new MongoDBClient(config.mongoDB)


const schema = makeExecutableSchema({ typeDefs, resolvers })


// Setup express-graphql with merged schema and resolvers
app.use('/graphql', graphqlHTTP({
  schema: schema,
  context: getApplicationContext(),
  graphiql: true,
}))

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  //TODO: delete
  await dbClient.connect()
  console.log(`Server is running at http://localhost:${PORT}/graphql`)
})
