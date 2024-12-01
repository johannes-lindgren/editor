import {
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material'
import {
  FormEventHandler,
  FunctionComponent,
  memo,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react'
import {
  ContentInput,
  objectInput,
  ObjectContentInput,
  textInput,
  TextContentInput,
  NumberContentInput,
  numberInput,
  TextContent,
  NumberContent,
} from '@editor/model'
import { CustomNumberInput } from './components/CustomNumberInput.tsx'
import { produce } from 'immer'

type Updater<T> = (fn: (draft: T) => T | void) => void

const TextContentInputView: FunctionComponent<{
  schema: TextContentInput
  value: TextContent
  onUpdate: Updater<TextContent>
}> = memo((props) => {
  const { schema, onUpdate, value } = props
  const inputId = useId()
  const helperTextId = useId()
  const handleInput: FormEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    // Must save in a variable because e will become destroyed after the event handler finishes,
    //  and the producer callback function might be called later
    const value = e.currentTarget.value
    onUpdate(() => value)
  }
  return (
    <FormControl>
      <InputLabel htmlFor={inputId}>{schema.label}</InputLabel>
      <OutlinedInput
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={value}
        onChange={handleInput}
      />
    </FormControl>
  )
})

const NumberContentInputView: FunctionComponent<{
  schema: NumberContentInput
  value: NumberContent
  onUpdate: Updater<NumberContent>
}> = memo((props) => {
  const { schema, value, onUpdate } = props
  const inputId = useId()
  const helperTextId = useId()
  const handleInput = (_e, value) => {
    onUpdate(() => value)
  }
  return (
    <FormControl>
      <FormHelperText id={helperTextId}>{schema.label}</FormHelperText>
      <CustomNumberInput
        id={inputId}
        aria-describedby={helperTextId}
        value={value}
        onChange={handleInput}
      />
    </FormControl>
  )
})

const ObjectContentInputView: FunctionComponent<{
  schema: ObjectContentInput
  value: ObjectContentInput
  onUpdate: Updater<ObjectContentInput>
}> = memo((props) => {
  const { schema, value, onUpdate } = props

  // Memoize callbacks for each key
  const handlers = useMemo(() => {
    return Object.keys(schema.fields).reduce((acc, key) => {
      acc[key] = (fn: (draft: unknown) => void) => {
        onUpdate((draft) => {
          const res = fn(draft[key])
          if (res !== undefined) {
            draft[key] = res
          } else {
            return
          }
        })
      }
      return acc
    }, {})
  }, [schema.fields, onUpdate])

  return (
    <Stack gap={1} p={2}>
      {Object.entries(schema.fields).map(([key, field]) => (
        <ContentInputView
          schema={field}
          key={key}
          value={value?.[key]}
          onUpdate={handlers[key]}
        />
      ))}
    </Stack>
  )
})

const ContentInputView: FunctionComponent<{
  schema: ContentInput
  value: ContentInput
  onUpdate: Updater<any>
}> = memo((props) => {
  const { schema, value, onUpdate } = props
  switch (schema.tag) {
    case 'text-input':
      return (
        <TextContentInputView
          schema={schema}
          value={value}
          onUpdate={onUpdate}
        />
      )
    case 'object-input':
      return (
        <ObjectContentInputView
          schema={schema}
          value={value}
          onUpdate={onUpdate}
        />
      )
    case 'number-input':
      return (
        <NumberContentInputView
          schema={schema}
          value={value}
          onUpdate={onUpdate}
        />
      )
  }
})

export const Editor: FunctionComponent = () => {
  const [textState, setTextState] = useState<TextContent>('Default text')
  const handleTextStateUpdate: Updater<TextContent> = useCallback((fn) => {
    setTextState(produce(fn))
  }, [])

  const [objectState, setObjectState] = useState<any>({
    title: 'Title',
    description: 'Description',
    paddingTop: 10,
    body: {
      title: 'Title',
      description: 'Description',
    },
  })
  const handleObjectStateUpdate: Updater<any> = useCallback((fn) => {
    setObjectState(produce(fn))
  }, [])

  return (
    <Stack>
      <Typography variant="h1">Editor</Typography>
      <Typography variant="h2">Text</Typography>
      <JsonView value={textState} />
      <ContentInputView
        schema={textInput({
          label: 'Title',
        })}
        value={textState}
        onUpdate={handleTextStateUpdate}
      />
      <Typography variant="h2">Object</Typography>
      <JsonView value={objectState} />
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
        value={objectState}
        onUpdate={handleObjectStateUpdate}
      />
    </Stack>
  )
}

const JsonView: FunctionComponent<{
  value: unknown
}> = (props) => {
  return (
    <pre>
      <code>{JSON.stringify(props.value, null, 2)}</code>
    </pre>
  )
}
