import { createModule } from 'graphql-modules'
import { resolvers } from './resolvers'
import { typeDefs } from './type.defs'

export const producer = createModule({
  id: 'producer',
  dirname: __dirname,
  typeDefs,
  resolvers,
})