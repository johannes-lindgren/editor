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

export type ContentUuid = string
export const isContentUuid = isString

export type TextContent = {
  tag: 'text'
  uuid: ContentUuid
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
  uuid: ContentUuid
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
  uuid: ContentUuid
  valueUuid: ContentUuid
}

/*
 * Object
 */

export type ObjectContent = {
  tag: 'object'
  uuid: ContentUuid
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
  uuid: ContentUuid
  value: ContentReference[]
}

export const isArrayContent = objectGuard({
  tag: equalsGuard('array'),
  uuid: isContentUuid,
  value: isArray,
})

export type ArrayContentInput = {
  tag: 'array-input'
  item: ContentInput
}
export const arrayInput = (
  params: Omit<ArrayContentInput, 'tag'>,
): ArrayContentInput => ({
  tag: 'array-input',
  ...params,
})

/*
 * All
 */

export type Content = TextContent | NumberContent | ObjectContent | ArrayContent

export type ContentInput =
  | TextContentInput
  | NumberContentInput
  | ObjectContentInput
  | ArrayContentInput

export type ContentStore = Record<ContentUuid, Content>

/*
 *  Flatten/Unflatten
 */

// TODO
export type ContentTree = unknown
export type ValueOnlyTree = unknown

export const toStore = (content: ContentTree): ContentStore => {
  const result: Record<ContentUuid, Content> = {}

  switch (content.tag) {
    case 'text':
      result[content.uuid] = content
      break
    case 'number':
      result[content.uuid] = content
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
          {} as Record<ContentUuid, ContentReference>,
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

export const toTree = (
  store: ContentStore,
  rootUuid: ContentUuid,
): ContentTree => {
  const content = store[rootUuid]
  switch (content.tag) {
    case 'text':
      return content
    case 'number':
      return content
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
