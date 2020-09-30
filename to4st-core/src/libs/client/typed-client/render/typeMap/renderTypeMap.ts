import {
  GraphQLSchema,
  isEnumType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
  isInputObjectType,
} from 'graphql'
import { excludedTypes } from '../common/excludedTypes'
import { objectType } from './objectType'
import { scalarType } from './scalarType'
import { unionType } from './unionType'

export interface ArgMap {
  [arg: string]: [string, string] | undefined
}

export interface Field {
  type: string
  args?: ArgMap
}

export interface FieldMap {
  [field: string]: Field | undefined
}

export interface Type {
  name: string
  fields?: FieldMap
  scalar?: string[]
}

export interface TypeMap {
  [type: string]: Type | undefined
}


