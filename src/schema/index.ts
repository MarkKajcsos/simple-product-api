
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

const loadedFiles = loadFilesSync(`${__dirname}/**/type.defs.ts`)
const resolversArray = loadFilesSync(`${__dirname}/**/resolvers.ts`)

export const typeDefs = mergeTypeDefs(loadedFiles)
export const resolvers = mergeResolvers(resolversArray)
