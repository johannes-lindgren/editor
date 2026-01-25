import {
  ContentInput,
  NumberContentInput,
  ObjectContentInput,
  TextContentInput,
  PrimitiveContentInput,
} from './index.ts'

export type InferPrimitive<T extends PrimitiveContentInput> = T['value']
export type InferText<_T extends TextContentInput> = string
export type InferNumber<_T extends NumberContentInput> = number
export type InferObject<T extends ObjectContentInput> = {
  [key in keyof T['fields']]: InferContentInput<T['fields'][key]>
}
export type InferContentInput<T extends ContentInput> =
  T extends PrimitiveContentInput
    ? InferPrimitive<T>
    : T extends TextContentInput
      ? InferText<T>
      : T extends NumberContentInput
        ? InferNumber<T>
        : T extends ObjectContentInput
          ? InferObject<T>
          : never
