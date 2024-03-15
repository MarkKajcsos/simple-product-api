import { createModule } from 'graphql-modules'
import { resolvers } from './resolvers'
import { typeDefs } from './type.defs'

export const product = createModule({
  id: 'product',
  dirname: __dirname,
  typeDefs,
  resolvers,
})