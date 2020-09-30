import { GraphQLSchema } from 'graphql'
import { Config } from '../../config'

export class RenderContext {
  constructor(public schema?: GraphQLSchema, public config?: Config) {}
}
