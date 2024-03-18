// index.ts
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { getApplicationContext } from './application.context'
import { Config } from './model/config/config'
import { resolvers, typeDefs } from './schema'
import MongoDBClient from './utils/client/mongodb.client'
import { configFromYaml } from './utils/config/config.from.yaml'
import { CONFIG_PATH, SERVICE_NAME, SERVICE_VERSION } from './utils/config/defaults'

const config: Config = configFromYaml(CONFIG_PATH)
config.app = Object.assign(
  {
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  },
  config.app
)


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
