// index.ts
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { getApplicationContext } from './application.context'
import { resolvers, typeDefs } from './schema'
import MongoDBClient from './utils/client/mongodb.client'
import config from './utils/config'
import logger from './utils/logger'


const app = express()
const dbClient = new MongoDBClient(config.mongoDB)
const schema = makeExecutableSchema({ typeDefs, resolvers })


/**
 * Setup graphql endpoint. Enable graphical viewer.
 */
app.use('/graphql', graphqlHTTP({
  schema: schema,
  context: getApplicationContext(),
  graphiql: true,
}))

/**
 * The shutdown routine.
 *
 * @returns {Promise<void>} In any case.
 */
export async function shutdown(): Promise<void> {
  try {
    await dbClient.close()
  } catch (e) {
    logger.error(e)
  }
  logger.info('APP: shutdown completed.')
}


(async () => {
  await dbClient.connect()
  app.listen(config.app.port, async () => {
    logger.info(`Server is running at http://${config.app.host}:${config.app.port}/graphql`)
  })
})().catch((e: Error) => {
  logger.error(`Server running has failed: ${e.message}`)
})