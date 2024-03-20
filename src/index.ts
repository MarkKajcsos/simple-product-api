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
export const dbClient = new MongoDBClient(config.mongoDB)


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
    await dbClient.close();
  } catch (e) {
    logger.error(e);
  }
  logger.info(`APP: shutdown completed.`);
}

// handle unexpected app shutdown
process.on('SIGINT', () => {
  logger.info(`APP: shutdown with signal SIGINT`)
  shutdown()
    .then(() => {
      process.exit(0)
    })
    .catch(() => {
      process.exit(1)
    })
})

// handle unexpected app shutdowns
process.on('SIGTERM', () => {
  logger.info(`APP: shutdown with signal SIGTERM`)
  shutdown()
    .then(() => {
      process.exit(0)
    })
    .catch(() => {
      process.exit(1)
    })
})

// handle uncaughtException
// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('uncaughtException', (ex: Error) => {
  shutdown().finally(() => {
    process.exit(1)
  })
})

// handle unhandledRejection
// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('unhandledRejection', (reason: unknown | null | undefined, promise: Promise<unknown>) => {
  shutdown().finally(() => {
    process.exit(1)
  })
})

// Start the server
app.listen(config.app.port, async () => {
  await dbClient.connect()
  console.log(`Server is running at http://${config.app.host}:${config.app.port}/graphql`)
})
