import {
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material'
import { FunctionComponent, useId } from 'react'
import {
  ContentInput,
  objectInput,
  ObjectContentInput,
  textInput,
  TextContentInput,
  NumberContentInput,
  numberInput,
} from '@editor/model'
import { CustomNumberInput } from './components/CustomNumberInput.tsx'

const TextContentInputView: FunctionComponent<{
  schema: TextContentInput
}> = (props) => {
  const { schema } = props
  const inputId = useId()
  const helperTextId = useId()
  return (
    <FormControl>
      <InputLabel htmlFor={inputId}>{schema.label}</InputLabel>
      <OutlinedInput id={inputId} aria-describedby={helperTextId} />
      <FormHelperText id={helperTextId}>
        We'll never share your email.
      </FormHelperText>
    </FormControl>
  )
}

const NumberContentInputView: FunctionComponent<{
  schema: NumberContentInput
}> = (props) => {
  const { schema } = props
  const inputId = useId()
  const helperTextId = useId()
  return (
    <FormControl>
      <InputLabel htmlFor={inputId}>{schema.label}</InputLabel>
      <CustomNumberInput id={inputId} aria-describedby={helperTextId} />
      <FormHelperText id={helperTextId}>
        We'll never share your email.
      </FormHelperText>
    </FormControl>
  )
}

const ObjectContentInputView: FunctionComponent<{
  schema: ObjectContentInput
}> = (props) => {
  const { schema } = props
  return (
    <Stack gap={1}>
      {Object.entries(schema.fields).map(([key, field]) => (
        <ContentInputView schema={field} key={key} />
      ))}
    </Stack>
  )
}

const ContentInputView: FunctionComponent<{
  schema: ContentInput
}> = (props) => {
  const { schema } = props
  switch (schema.tag) {
    case 'text-input':
      return <TextContentInputView schema={schema} />
    case 'object-input':
      return <ObjectContentInputView schema={schema} />
    case 'number-input':
      return <NumberContentInputView schema={schema} />
  }
}

export const Editor: FunctionComponent = () => {
  return (
    <Stack>
      <Typography variant="h1">Editor</Typography>
      <ContentInputView
        schema={objectInput({
          fields: {
            title: textInput({
              label: 'Title',
            }),
            description: textInput({
              label: 'Description',
            }),
            paddingTop: numberInput({
              label: 'Padding Top',
            }),
            body: objectInput({
              fields: {
                title: textInput({
                  label: 'Title',
                }),
                description: textInput({
                  label: 'Description',
                }),
              },
            }),
          },
        })}
      />
    </Stack>
  )
}
