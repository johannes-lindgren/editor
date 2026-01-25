import { NumberContentInput, TextContentInput } from './index.ts'

export type InferText<_T extends TextContentInput> = string
export type InferNumber<_T extends NumberContentInput> = number
