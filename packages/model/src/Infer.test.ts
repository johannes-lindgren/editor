import { numberInput, objectInput, textInput } from './input.ts'
import { InferContentInput } from './Infer.ts'

const aInput = objectInput({
  fields: {
    name: textInput(),
    age: numberInput(),
    address: objectInput({
      fields: {
        street: textInput(),
        city: textInput(),
      },
    }),
  },
})

type A = InferContentInput<typeof aInput>

const a: A = {
  name: 'Alice',
  age: 1,
  address: {
    street: '123 Main St',
    city: 'Wonderland',
  },
}
console.log('a', a)
