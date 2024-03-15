// index.ts
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { ApplicationContextFactory } from './application.context';
import { resolvers, typeDefs } from './schema';
import { Config } from './utils/config/config';
import { configFromYaml } from './utils/config/config.from.yaml';
import { CONFIG_PATH, SERVICE_NAME, SERVICE_VERSION } from './utils/config/defaults';

const app = express()

const config: Config = configFromYaml(CONFIG_PATH)
config.app = Object.assign(
  {
    name: SERVICE_NAME,
    version: SERVICE_VERSION,
  },
  config.app
)


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
