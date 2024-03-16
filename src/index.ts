// index.ts
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { ApplicationContextFactory } from './application.context';
import { Config } from './model/config/config';
import { resolvers, typeDefs } from './schema';
import MongoDBClient from './utils/client/mongodb.client';
import { configFromYaml } from './utils/config/config.from.yaml';
import { CONFIG_PATH, SERVICE_NAME, SERVICE_VERSION } from './utils/config/defaults';


const app = express()

// const connectToDAtabase = async () => {
//   const client = new MongoClient(config.mongoDBConfig.url)
//   let cachedConnection
//   if(cachedConnection) return cachedConnection
  
//   try {
//     const connection = await client.connect()    
//     cachedConnection = connection
//     return connection
//   } catch(error) {
//     console.error(error)
//   }
// }



const config: Config = configFromYaml(CONFIG_PATH)
config.app = Object.assign(
  {
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  },
  config.app
  )
  
MongoDBClient.getInstance(config.mongoDBConfig)

const schema = makeExecutableSchema({ typeDefs, resolvers })

// export const newschema = makeExecutableSchema({ typeDefs, resolvers })
const applicationContext = ApplicationContextFactory.getApplicationContext(config)

// Setup express-graphql with merged schema and resolvers
app.use('/graphql', graphqlHTTP({
  schema: schema,
  context: applicationContext,
  graphiql: true,
}));

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/graphql`);
});
