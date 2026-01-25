import {
  arrayGuard,
  equalsGuard,
  isNumber,
  isString,
  objectGuard,
  optionalGuard,
} from 'pure-parse'
import { v4 as randomUuid } from 'uuid'

/*
 * Uuid
 */

export type Uuid = string
export const isUuid = isString

/*
 * Reference
 */

export type ContentReference = {
  tag: 'reference'
  uuid: Uuid
  valueUuid: Uuid
}

export const isContentReference = objectGuard<ContentReference>({
  tag: equalsGuard('reference'),
  uuid: isUuid,
  valueUuid: isUuid,
})

export type ContentInputReference = {
  tag: 'reference-input'
  uuid: Uuid
  inputUuid: Uuid
}

export const inputRef = (
  contentInput: ContentInput,
): ContentInputReference => ({
  tag: 'reference-input',
  uuid: randomUuid(),
  inputUuid: contentInput.uuid,
})

export const isContentInputReference = objectGuard<ContentInputReference>({
  tag: equalsGuard('reference-input'),
  uuid: isUuid,
  inputUuid: isUuid,
})

/*
 * Text
 */

export type TextContent = {
  tag: 'text'
  uuid: Uuid
  input?: ContentInputReference
  value: string
}

export const isTextContent = objectGuard<TextContent>({
  tag: equalsGuard('text'),
  uuid: isUuid,
  input: optionalGuard(isContentInputReference),
  value: isString,
})

export type TextContentInput = {
  tag: 'text-input'
  uuid: Uuid
  label?: string
}

export const textInput = (
  params?: Omit<TextContentInput, 'tag' | 'uuid'>,
): TextContentInput => ({
  tag: 'text-input',
  uuid: randomUuid(),
  ...params,
})

/*
 * Number
 */

export type NumberContent = {
  tag: 'number'
  uuid: Uuid
  input?: ContentInputReference
  value: number
}

export const isNumberContent = objectGuard<NumberContent>({
  tag: equalsGuard('number'),
  uuid: isUuid,
  input: optionalGuard(isContentInputReference),
  value: isNumber,
})

export type NumberContentInput = {
  tag: 'number-input'
  uuid: Uuid
  label?: string
}

export const numberInput = (
  params?: Omit<NumberContentInput, 'tag' | 'uuid'>,
): NumberContentInput => ({
  tag: 'number-input',
  uuid: randomUuid(),
  ...params,
})

/*
 * Object
 */

export type ObjectContent = {
  tag: 'object'
  uuid: Uuid
  input?: ContentInputReference
  value: Record<string, ContentReference>
}
export type ObjectContentInput = {
  tag: 'object-input'
  uuid: Uuid
  label?: string
  fields: Record<string, ContentInput>
}

export const objectInput = <T extends Omit<ObjectContentInput, 'tag' | 'uuid'>>(
  params: T,
): T & {
  tag: 'object-input'
  uuid: Uuid
} => ({
  tag: 'object-input',
  uuid: randomUuid(),
  ...params,
})

/*
 * Array
 */

export type ArrayContent = {
  tag: 'array'
  uuid: Uuid
  input?: ContentInputReference
  value: ContentReference[]
}

export const isArrayContent = objectGuard<ArrayContent>({
  tag: equalsGuard('array'),
  uuid: isUuid,
  input: optionalGuard(isContentInputReference),
  value: arrayGuard(isContentReference),
})

export type ArrayContentInput = {
  tag: 'array-input'
  uuid: Uuid
  label?: string
  items: FlatContent[]
}
export const arrayInput = (
  params: Omit<ArrayContentInput, 'tag' | 'uuid'>,
): ArrayContentInput => ({
  tag: 'array-input',
  uuid: randomUuid(),
  ...params,
})

/*
 * Primitive
 */

export type PrimitiveContent = {
  tag: 'primitive'
  uuid: Uuid
  input?: ContentInputReference
  // TODO allow other primitive JSON serializable types
  value: string
}

export const isPrimitiveContent = objectGuard<PrimitiveContent>({
  tag: equalsGuard('primitive'),
  uuid: isUuid,
  input: optionalGuard(isContentInputReference),
  value: isString,
})

export type PrimitiveContentInput = {
  tag: 'primitive-input'
  uuid: Uuid
  label?: string
  value: string
}

export const primitiveInput = (
  params: Omit<PrimitiveContentInput, 'tag' | 'uuid'>,
): PrimitiveContentInput => ({
  tag: 'primitive-input',
  uuid: randomUuid(),
  ...params,
})

/*
 * oneOf
 */

export type OneOfContent = {
  tag: 'one-of'
  uuid: Uuid
  input?: ContentInputReference
  value: ContentReference
}

export const isOneOfContent = objectGuard<OneOfContent>({
  tag: equalsGuard('one-of'),
  uuid: isUuid,
  input: optionalGuard(isContentInputReference),
  value: objectGuard({
    tag: equalsGuard('reference'),
    uuid: isUuid,
    valueUuid: isUuid,
  }),
})

export type OneOfContentInput = {
  tag: 'one-of-input'
  uuid: Uuid
  label?: string
  options: FlatContent[]
}

export const oneOfInput = (
  params: Omit<OneOfContentInput, 'tag' | 'uuid'>,
): OneOfContentInput => ({
  tag: 'one-of-input',
  uuid: randomUuid(),
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

export type FlatStore<T> = {
  data: Record<Uuid, T>
}

export type FlatContent = {
  tag: 'content-store'
  rootUuid: Uuid
  data: Record<Uuid, Content>
}

export type InputMap = {
  tag: 'content-input-store'
  data: Record<Uuid, ContentInput>
}

// export type ContentTree = {
//   tag: 'content-tree'
//   data: unknown
// }

export type ContentStoreTmp = Record<Uuid, Content>

/*
 *  Flatten/Unflatten
 */

// TODO
export type ContentTree = unknown
export type ValueOnlyTree = unknown

export const subStore = (
  store: ContentStoreTmp,
  uuid: Uuid,
): ContentStoreTmp => {
  throw new Error('Not implemented')
  const content = store[uuid]
  if (content === undefined) {
    return {}
  }
  // switch (content.tag) {
  //   case 'text':
  //     return { [uuid]: content }
  //   case 'number':
  //     return { [uuid]: content }
  //   case 'primitive':
  //     return { [uuid]: content }
  //   case 'one-of':
  //     return subStore(store, content.value.valueUuid)
  //   case 'object':
  //     return Object.entries(content.value).reduce((acc, [_key, ref]) => {
  //       Object.assign(acc, subStore(store, ref.valueUuid))
  //       return acc
  //     }, {} as ContentStoreTmp)
  //   case 'array':
  //     return content.value.reduce((acc, ref) => {
  //       return { ...acc, ...subStore(store, ref.valueUuid) }
  //     }, {} as ContentStoreTmp)
  //   default:
  //     // TODO of course, we're not going to keep any exceptions in the final version
  //     throw new Error('Unknown tag')
  // }
}

/**
 * Not meant to be used normally, but useful in tests
 * @param content
 */
export const toFlat = (content: ContentTree): FlatContent => {
  const result: Record<Uuid, Content> = {}

  // @ts-expect-error
  switch (content.tag) {
    case 'text':
      // @ts-expect-error
      result[content.uuid] = content
      break
    case 'number':
      // @ts-expect-error
      result[content.uuid] = content
      break
    case 'primitive':
      // @ts-expect-error
      result[content.uuid] = content
      break
    case 'one-of':
      // @ts-expect-error
      const child = content.value
      const store = toFlat(child)
      Object.assign(result, store.data)
      // @ts-expect-error
      result[content.uuid] = {
        // @ts-expect-error
        ...content,
        value: {
          tag: 'reference',
          uuid: randomUuid(),
          valueUuid: child.uuid,
        },
      }
      break
    case 'object':
      // @ts-expect-error
      result[content.uuid] = {
        // @ts-expect-error
        ...content,
        // @ts-expect-error
        value: Object.entries(content.value).reduce(
          (acc, [key, child]) => {
            const store = toFlat(child)
            Object.assign(result, store.data)
            acc[key] = {
              tag: 'reference',
              uuid: randomUuid(),
              // @ts-expect-error
              valueUuid: child.uuid,
            }
            return acc
          },
          {} as Record<Uuid, ContentReference>,
        ),
      }
      break
    case 'array':
      // @ts-expect-error
      result[content.uuid] = {
        // @ts-expect-error
        ...content,
        // @ts-expect-error
        value: content.value.map((child) => {
          const store = toFlat(child)
          Object.assign(result, store.data)
          return {
            tag: 'reference',
            uuid: randomUuid(),
            valueUuid: child.uuid,
          }
        }),
      }
      break
    default:
      // @ts-expect-error
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error(`Unknown tag ${JSON.stringify(content.tag)}`)
  }
  return {
    tag: 'content-store',
    // @ts-expect-error
    rootUuid: content.uuid,
    data: result,
  }
}

export const toTree = (store: FlatContent): ContentTree => {
  const content = store.data[store.rootUuid]
  if (content === undefined) {
    // TODO of course, we're not going to keep any exceptions in the final version
    throw new Error('Undefined content')
  }
  switch (content.tag) {
    case 'text':
      return content
    case 'number':
      return content
    case 'primitive':
      return content
    case 'one-of':
      return {
        ...content,
        value: toTree({ ...store, rootUuid: content.value.valueUuid }),
      }
    case 'object':
      return {
        ...content,
        value: Object.entries(content.value).reduce(
          (acc, [key, ref]) => {
            acc[key] = toTree({ ...store, rootUuid: ref.valueUuid })
            return acc
          },
          {} as Record<string, ContentTree>,
        ),
      }
    case 'array':
      return {
        ...content,
        value: content.value.map((ref) =>
          toTree({ ...store, rootUuid: ref.valueUuid }),
        ),
      }
    default:
      // @ts-expect-error
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error(`Unknown tag ${content.tag}`)
  }
}

export const toValueOnlyTree = (content: ContentTree): ValueOnlyTree => {
  // @ts-expect-error
  switch (content.tag) {
    case 'text':
      // @ts-expect-error
      return content.value
    case 'number':
      // @ts-expect-error
      return content.value
    case 'primitive':
      // @ts-expect-error
      return content.value
    case 'object':
      // @ts-expect-error
      return Object.entries(content.value).reduce(
        (acc, [key, child]) => {
          acc[key] = toValueOnlyTree(child)
          return acc
        },
        {} as Record<string, ValueOnlyTree>,
      )
    case 'array':
      // @ts-expect-error
      return content.value.map(toValueOnlyTree)
    case 'one-of':
      // @ts-expect-error
      return toValueOnlyTree(content.value)
    default:
      // @ts-expect-error
      // TODO of course, we're not going to keep any exceptions in the final version
      throw new Error(`Unknown tag ${JSON.stringify(content.tag)}`)
  }
}

export const cloneContent = (content: FlatContent): FlatContent => {
  const newUuidFromOld = uuidMapping(content.data)
  const newRootUuid = newUuidFromOld.get(content.rootUuid)
  if (newRootUuid === undefined) {
    // Should never happen
    throw new Error('Undefined root uuid')
  }
  const result: Record<Uuid, Content> = {}
  for (const [oldUuid, newUuid] of newUuidFromOld) {
    const oldContent = content.data[oldUuid]
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
      case 'object':
        result[newUuid] = {
          tag: 'object',
          // TODO extract function
          input: oldContent.input
            ? {
                ...oldContent.input,
                uuid: randomUuid(),
              }
            : undefined,
          uuid: newUuid,
          value: Object.entries(oldContent.value).reduce(
            (acc, [key, child]) => {
              const newValueUuid = newUuidFromOld.get(child.valueUuid)
              if (newValueUuid === undefined) {
                // Should never happen
                throw new Error('Undefined new uuid')
              }
              acc[key] = {
                tag: 'reference',
                uuid: randomUuid(),
                valueUuid: newValueUuid,
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
          value: oldContent.value.map((child) => {
            const newValueUuid = newUuidFromOld.get(child.valueUuid)
            if (newValueUuid === undefined) {
              // Should never happen
              throw new Error('Undefined new uuid')
            }
            return {
              tag: 'reference',
              uuid: randomUuid(),
              valueUuid: newValueUuid,
            }
          }),
        }
        break
      case 'one-of':
        {
          const child = oldContent.value
          const newValueUuid = newUuidFromOld.get(child.valueUuid)
          if (newValueUuid === undefined) {
            // Should never happen
            throw new Error('Undefined new uuid')
          }
          result[newUuid] = {
            tag: 'one-of',
            uuid: newUuid,
            input: oldContent.input
              ? {
                  ...oldContent.input,
                  uuid: randomUuid(),
                }
              : undefined,
            value: {
              tag: 'reference',
              uuid: randomUuid(),
              valueUuid: newValueUuid,
            },
          }
        }
        break
      default:
        // @ts-expect-error
        // TODO of course, we're not going to keep any exceptions in the final version
        throw new Error(`Unknown tag ${JSON.stringify(oldContent.tag)}`)
    }
  }
  return {
    tag: 'content-store',
    rootUuid: newRootUuid,
    data: result,
  }
}

const uuidMapping = (content: ContentStoreTmp): Map<Uuid, Uuid> => {
  const result = new Map<Uuid, Uuid>()
  const oldUuids = Object.keys(content)
  for (const oldUuid of oldUuids) {
    result.set(oldUuid, randomUuid())
  }
  return result
}
