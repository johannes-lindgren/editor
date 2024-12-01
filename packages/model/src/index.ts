/**
 * Text
 */
import { equalsGuard, isNumber, isString, objectGuard } from 'pure-parse'
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

/**
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

/**
 * Reference
 */

export type ContentReference = {
  tag: 'reference'
  uuid: ContentUuid
  valueUuid: ContentUuid
}

/**
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

/**
 * All
 */

export type Content = TextContent | ObjectContent | NumberContent

export type ContentInput =
  | TextContentInput
  | ObjectContentInput
  | NumberContentInput

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
            const m = toStore(child)
            Object.assign(result, m)
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
  }
  return result
}

export const toTree = (
  content: ContentStore,
  rootUuid: ContentUuid,
): ContentTree => {
  const root = content[rootUuid]
  switch (root.tag) {
    case 'text':
      return root
    case 'number':
      return root
    case 'object':
      return {
        tag: 'object',
        uuid: root.uuid,
        value: Object.entries(root.value).reduce(
          (acc, [key, ref]) => {
            acc[key] = toTree(content, ref.valueUuid)
            return acc
          },
          {} as Record<string, ContentTree>,
        ),
      }
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
  }
}
