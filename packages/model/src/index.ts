/**
 * Text
 */
import { equalsGuard, isNumber, isString, objectGuard } from 'pure-parse'

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
