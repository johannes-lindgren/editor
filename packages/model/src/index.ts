/**
 * Text
 */

export type TextContent = string
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

export type NumberContent = number
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
 * Object
 */

export type ObjectContent = {
  [key: string]: Content
}
export type ObjectContentInput = {
  tag: 'object-input'
  fields: Record<string, ContentInput>
}

export type ObjectInputParams = {
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
