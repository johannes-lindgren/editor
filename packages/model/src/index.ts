/*
 * Text
 */
import {
  equalsGuard,
  isArray,
  isNumber,
  isString,
  objectGuard,
} from 'pure-parse'
import { v4 as randomUuid } from 'uuid'

export type Uuid = string
export const isContentUuid = isString

export type TextContent = {
  tag: 'text'
  uuid: Uuid
  value: string
}

export const isTextContent = objectGuard<TextContent>({
  tag: equalsGuard('text'),
  uuid: isContentUuid,
  value: isString,
})

export type TextContentInput = {
  tag: 'text-input'
  label?: string
}

export const textInput = (
  params?: Omit<TextContentInput, 'tag'>,
): TextContentInput => ({
  tag: 'text-input',
  ...params,
})

/*
 * Number
 */

export type NumberContent = {
  tag: 'number'
  uuid: Uuid
  value: number
}

export const isNumberContent = objectGuard<NumberContent>({
  tag: equalsGuard('number'),
  uuid: isContentUuid,
  value: isNumber,
})

export type NumberContentInput = {
  tag: 'number-input'
  label?: string
}

export const numberInput = (
  params?: Omit<NumberContentInput, 'tag'>,
): NumberContentInput => ({
  tag: 'number-input',
  ...params,
})

/*
 * Reference
 */

export type ContentReference = {
  tag: 'reference'
  uuid: Uuid
  valueUuid: Uuid
}

export type ContentInputReference = {
  tag: 'reference-input'
  uuid: Uuid
  inputUuid: Uuid
}

/*
 * Object
 */

export type ObjectContent = {
  tag: 'object'
  uuid: Uuid
  value: Record<string, ContentReference>
}
export type ObjectContentInput = {
  tag: 'object-input'
  fields: Record<string, ContentInput>
}

export const objectInput = (
  params: Omit<ObjectContentInput, 'tag'>,
): ObjectContentInput => ({
  tag: 'object-input',
  ...params,
})

/*
 * Array
 */

export type ArrayContent = {
  tag: 'array'
  uuid: Uuid
  value: ContentReference[]
}

export const isArrayContent = objectGuard({
  tag: equalsGuard('array'),
  uuid: isContentUuid,
  value: isArray,
})

export type ArrayContentInput = {
  tag: 'array-input'
  items: Content[]
}
export const arrayInput = (
  params: Omit<ArrayContentInput, 'tag'>,
): ArrayContentInput => ({
  tag: 'array-input',
  ...params,
})

/*
 * Primitive
 */

export type PrimitiveContent = {
  tag: 'primitive'
  uuid: Uuid
  value: string
}

export const isPrimitiveContent = objectGuard<PrimitiveContent>({
  tag: equalsGuard('primitive'),
  uuid: isContentUuid,
  value: isString,
})

export type PrimitiveContentInput = {
  tag: 'primitive-input'
  label?: string
  value: string
}

export const primitiveInput = (
  params: Omit<PrimitiveContentInput, 'tag'>,
): PrimitiveContentInput => ({
  tag: 'primitive-input',
  ...params,
})

/*
 * oneOf
 */

export type OneOfContent = {
  tag: 'one-of'
  uuid: Uuid
  value: ContentReference
}

export const isOneOfContent = objectGuard<OneOfContent>({
  tag: equalsGuard('one-of'),
  uuid: isContentUuid,
  value: objectGuard({
    tag: equalsGuard('reference'),
    uuid: isContentUuid,
    valueUuid: isContentUuid,
  }),
})

export type OneOfContentInput = {
  tag: 'one-of-input'
  label?: string
  options: ContentInput[]
}

export const oneOfInput = (
  params: Omit<OneOfContentInput, 'tag'>,
): OneOfContentInput => ({
  tag: 'one-of-input',
  ...params,
})

/*
 * All
 */

export type Content =
  | TextContent
  | NumberContent
  | ObjectContent
  | ArrayContent
  | PrimitiveContent
  | OneOfContent

export type ContentInput =
  | TextContentInput
  | NumberContentInput
  | ObjectContentInput
  | ArrayContentInput
  | PrimitiveContentInput
  | OneOfContentInput
  | ContentInputReference

export type ContentStore = Record<Uuid, Content>

/*
 *  Flatten/Unflatten
 */

// TODO
export type ContentTree = unknown
export type ValueOnlyTree = unknown

export const subStore = (store: ContentStore, uuid: Uuid): ContentStore => {
  const content = store[uuid]
  if (content === undefined) {
    return {}
  }
  switch (content.tag) {
    case 'text':
      return { [uuid]: content }
    case 'number':
      return { [uuid]: content }
    case 'primitive':
      return { [uuid]: content }
    case 'one-of':
      return subStore(store, content.value.valueUuid)
    case 'object':
      return Object.entries(content.value).reduce((acc, [_key, ref]) => {
        Object.assign(acc, subStore(store, ref.valueUuid))
        return acc
      }, {} as ContentStore)
    case 'array':
      return content.value.reduce((acc, ref) => {
        return { ...acc, ...subStore(store, ref.valueUuid) }
      }, {} as ContentStore)
    default:
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error('Unknown tag')
  }
}

/**
 * Not meant to be used normally, but useful in tests
 * @param content
 */
export const toStore = (content: ContentTree): ContentStore => {
  const result: Record<Uuid, Content> = {}

  switch (content.tag) {
    case 'text':
      result[content.uuid] = content
      break
    case 'number':
      result[content.uuid] = content
      break
    case 'primitive':
      result[content.uuid] = content
      break
    case 'one-of':
      const child = content.value
      const store = toStore(child)
      Object.assign(result, store)
      result[content.uuid] = {
        tag: 'one-of',
        uuid: content.uuid,
        value: {
          tag: 'reference',
          uuid: randomUuid(),
          valueUuid: child.uuid,
        },
      }
      break
    case 'object':
      result[content.uuid] = {
        tag: 'object',
        uuid: content.uuid,
        value: Object.entries(content.value).reduce(
          (acc, [key, child]) => {
            const store = toStore(child)
            Object.assign(result, store)
            acc[key] = {
              tag: 'reference',
              uuid: randomUuid(),
              valueUuid: child.uuid,
            }
            return acc
          },
          {} as Record<Uuid, ContentReference>,
        ),
      }
      break
    case 'array':
      result[content.uuid] = {
        tag: 'array',
        uuid: content.uuid,
        value: content.value.map((child) => {
          const store = toStore(child)
          Object.assign(result, store)
          return {
            tag: 'reference',
            uuid: randomUuid(),
            valueUuid: child.uuid,
          }
        }),
      }
      break
    default:
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error(`Unknown tag ${JSON.stringify(content.tag)}`)
  }
  return result
}

export const toTree = (store: ContentStore, rootUuid: Uuid): ContentTree => {
  const content = store[rootUuid]
  switch (content.tag) {
    case 'text':
      return content
    case 'number':
      return content
    case 'primitive':
      return content
    case 'one-of':
      return toTree(store, content.value.valueUuid)
    case 'object':
      return {
        tag: 'object',
        uuid: content.uuid,
        value: Object.entries(content.value).reduce(
          (acc, [key, ref]) => {
            acc[key] = toTree(store, ref.valueUuid)
            return acc
          },
          {} as Record<string, ContentTree>,
        ),
      }
    case 'array':
      return {
        tag: 'array',
        uuid: content.uuid,
        value: content.value.map((ref) => toTree(store, ref.valueUuid)),
      }
    default:
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error('Unknown tag')
  }
}

export const toValueOnlyTree = (content: ContentTree): ValueOnlyTree => {
  switch (content.tag) {
    case 'text':
      return content.value
    case 'number':
      return content.value
    case 'primitive':
      return content.value
    case 'object':
      return Object.entries(content.value).reduce(
        (acc, [key, child]) => {
          acc[key] = toValueOnlyTree(child)
          return acc
        },
        {} as Record<string, ValueOnlyTree>,
      )
    case 'array':
      return content.value.map(toValueOnlyTree)
    default:
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error('Unknown tag')
  }
}

export const cloneContent = (content: ContentStore): ContentStore => {
  const newUuidFromOld = uuidMapping(content)
  const result: Record<Uuid, Content> = {}
  for (const [oldUuid, newUuid] of newUuidFromOld) {
    const oldContent = content[oldUuid]
    if (oldContent === undefined) {
      throw new Error('Undefined content')
    }
    switch (oldContent.tag) {
      case 'text':
        result[newUuid] = {
          ...oldContent,
          uuid: newUuid,
        }
        break
      case 'number':
        result[newUuid] = {
          ...oldContent,
          uuid: newUuid,
        }
        break
      case 'primitive':
        result[newUuid] = {
          ...oldContent,
          uuid: newUuid,
        }
        break
      case 'one-of':
        result[newUuid] = {
          ...oldContent,
          uuid: newUuid,
          value: {
            tag: 'reference',
            uuid: randomUuid(),
            valueUuid: newUuidFromOld.get(oldContent.value.valueUuid),
          },
        }
        break
      case 'object':
        result[newUuid] = {
          tag: 'object',
          uuid: newUuid,
          value: Object.entries(oldContent.value).reduce(
            (acc, [key, child]) => {
              acc[key] = {
                tag: 'reference',
                uuid: randomUuid(),
                valueUuid: newUuidFromOld.get(child.valueUuid),
              }
              return acc
            },
            {} as Record<string, ContentReference>,
          ),
        }
        break
      case 'array':
        result[newUuid] = {
          tag: 'array',
          uuid: newUuid,
          value: oldContent.value.map((child) => ({
            tag: 'reference',
            uuid: randomUuid(),
            valueUuid: newUuidFromOld.get(child.valueUuid),
          })),
        }
        break
      default:
        // TODO of course, we're not going to keep any exceptions in the final version
        throw new Error('Unknown tag')
    }
  }
  return result
}

const uuidMapping = (content: ContentStore): Map<Uuid, Uuid> => {
  const result = new Map<Uuid, Uuid>()
  const oldUuids = Object.keys(content)
  for (const oldUuid of oldUuids) {
    result.set(oldUuid, randomUuid())
  }
  return result
}
