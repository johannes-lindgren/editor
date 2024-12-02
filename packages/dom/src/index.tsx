import {
  Alert,
  FormControl,
  Stack,
  Typography,
  Box,
  AlertTitle,
} from '@mui/material'
import {
  createContext,
  FormEventHandler,
  FunctionComponent,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useSyncExternalStore,
} from 'react'
import {
  ContentInput,
  ObjectContentInput,
  TextContentInput,
  NumberContentInput,
  ContentUuid,
  ContentStore,
  isTextContent,
  isNumberContent,
  ArrayContentInput,
  isArrayContent,
  isPrimitiveContent,
} from '@editor/model'
import { Label, StyledInput, Button, CustomNumberInput } from './components'
import { v4 as randomUuid } from 'uuid'

type UpdateFn<T> = (draft: T) => void

export type EditorStore = {
  subscribe: (fn: (data: unknown) => void) => () => void
  get: () => ContentStore
  update: (fn: UpdateFn<ContentStore>) => void
}

const StoreContext = createContext<EditorStore | undefined>(undefined)

export const StoreContextProvider: FunctionComponent<{
  store: EditorStore
  children: ReactNode
}> = (props) => {
  const { store, children } = props
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

const useUpdater = () => {
  const store = useContext(StoreContext)!
  return store.update
}

export const useSelector = <Selection,>(
  selector: (store: ContentStore) => Selection,
): Selection => {
  const store = useContext(StoreContext)!

  const getSnapshot = useCallback(
    () => selector(store.get()),
    [store, selector],
  )

  return useSyncExternalStore(store.subscribe, getSnapshot)
}

const useSelectByUuid = (uuid: ContentUuid) => {
  return useCallback(
    (store: ContentStore) => {
      return store[uuid]
    },
    [uuid],
  )
}

const JsonView: FunctionComponent<{ data: unknown }> = (props) => {
  const { data } = props
  return (
    <Box
      component="pre"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 2,
        py: 1,
      }}
    >
      <Box component="code">{JSON.stringify(data, null, 2)}</Box>
    </Box>
  )
}

export const UnknownContentView: FunctionComponent<{
  schema: ContentInput
  content: unknown
}> = memo((props) => {
  const { schema, content } = props
  return (
    <Alert severity="error">
      <AlertTitle>
        The content does not adhere to the expected structure.
      </AlertTitle>
      <Typography>
        The schema expects the content to be of the following structure:
      </Typography>
      <Stack>
        <Typography variant="subtitle1">Schema:</Typography>
        <JsonView data={schema} />
        <Typography variant="subtitle1">Content:</Typography>
        <JsonView data={content} />
      </Stack>
    </Alert>
  )
})

export const UnknownInputView: FunctionComponent<{
  schema: ContentInput
}> = memo((props) => {
  const { schema } = props
  return (
    <Alert severity="error">
      <AlertTitle>Unknown input type</AlertTitle>
      <Typography>
        Cannot render the input because the input type is unknown.
      </Typography>
      <Stack>
        <Typography variant="subtitle1">Schema:</Typography>
        <JsonView data={schema} />
      </Stack>
    </Alert>
  )
})

export const ContentNotFoundView: FunctionComponent<{
  uuid: ContentUuid
}> = memo((props) => {
  const { uuid } = props
  return (
    <Alert severity="error">
      <AlertTitle>Content not found</AlertTitle>
      <Typography>
        Could not find content by uuid {JSON.stringify(uuid)}
      </Typography>
    </Alert>
  )
})

export const UnknownKeyView: FunctionComponent<{
  propertyName: string
}> = memo((props) => {
  const { key } = props
  return (
    <Alert severity="error">
      <AlertTitle>Unknown key</AlertTitle>
      <Typography>
        The key {JSON.stringify(key)} is not defined in the schema.
      </Typography>
    </Alert>
  )
})

const PrimitiveContentInputView: FunctionComponent<{
  schema: TextContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props
  const selectByUuid = useSelectByUuid(uuid)
  const content = useSelector(selectByUuid)
  const inputId = useId()
  const helperTextId = useId()

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isPrimitiveContent(content)) {
    return (
      <UnknownContentView
        content={content}
        schema={schema}
      />
    )
  }

  return (
    <FormControl>
      <Label htmlFor={inputId}>{schema.label}</Label>
      <StyledInput
        disabled
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
      />
    </FormControl>
  )
})

const TextContentInputView: FunctionComponent<{
  schema: TextContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props
  const selectByUuid = useSelectByUuid(uuid)
  const content = useSelector(selectByUuid)
  const inputId = useId()
  const helperTextId = useId()
  const update = useUpdater()
  const handleInput: FormEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    // Must save in a variable because e will become destroyed after the event handler finishes,
    //  and the producer callback function might be called later
    const value = e.currentTarget.value
    update((draft) => {
      const currentContent = draft[uuid]
      if (!isTextContent(currentContent)) {
        return
      }
      draft[uuid] = {
        ...currentContent,
        value,
      }
    })
  }

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isTextContent(content)) {
    return (
      <UnknownContentView
        content={content}
        schema={schema}
      />
    )
  }

  return (
    <FormControl>
      <Label htmlFor={inputId}>{schema.label}</Label>
      <StyledInput
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
        onChange={handleInput}
      />
    </FormControl>
  )
})

const NumberContentInputView: FunctionComponent<{
  schema: NumberContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props
  const selectByUuid = useSelectByUuid(uuid)
  const content = useSelector(selectByUuid)
  const inputId = useId()
  const helperTextId = useId()
  const update = useUpdater()
  const handleInput = (e, value: number | null) => {
    // Must save in a variable because e will become destroyed after the event handler finishes,
    //  and the producer callback function might be called later
    if (value === null) {
      return
    }
    update((draft) => {
      const currentContent = draft[uuid]
      if (!isNumberContent(currentContent)) {
        return
      }
      draft[uuid] = {
        ...currentContent,
        value,
      }
    })
  }

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isNumberContent(content)) {
    return (
      <UnknownContentView
        content={content}
        schema={schema}
      />
    )
  }

  return (
    <FormControl>
      <Label htmlFor={inputId}>{schema.label}</Label>
      <CustomNumberInput
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
        onChange={handleInput}
      />
    </FormControl>
  )
})

const ObjectContentInputView: FunctionComponent<{
  schema: ObjectContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props

  const selectByUuid = useSelectByUuid(uuid)
  const content = useSelector(selectByUuid)

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  return (
    <Stack
      sx={{
        gap: 2,
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Label>Body</Label>
      {Object.entries(schema.fields).map(([key, field]) => {
        const childContent = content.value[key]
        if (!childContent) {
          return <UnknownKeyView propertyName={key} />
        }
        return (
          <ContentInputView
            schema={field}
            key={key}
            uuid={childContent.valueUuid}
          />
        )
      })}
    </Stack>
  )
})

const ArrayContentInputView: FunctionComponent<{
  schema: ArrayContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props

  const update = useUpdater()
  const selectByUuid = useSelectByUuid(uuid)
  const content = useSelector(selectByUuid)

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isArrayContent(content)) {
    return (
      <UnknownContentView
        schema={schema}
        content={content}
      />
    )
  }

  const handleClickAdd = useCallback(() => {
    update((draft) => {
      const currentContent = draft[uuid]
      if (!isArrayContent(currentContent)) {
        return
      }
      console.log('Adding new item')
      const newContent = {
        tag: 'text',
        uuid: randomUuid(),
        value: 'New item',
      }
      draft[newContent.uuid] = newContent
      currentContent.value.push({
        tag: 'reference',
        uuid: randomUuid(),
        valueUuid: newContent.uuid,
      })
    })
  }, [])

  return (
    <Stack
      sx={{
        gap: 2,
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      {content.value.map((childContent, index) => (
        <ContentInputView
          key={index}
          schema={schema.item}
          uuid={childContent.valueUuid}
        />
      ))}
      <Button onClick={handleClickAdd}>Add</Button>
    </Stack>
  )
})

export const ContentInputView: FunctionComponent<{
  schema: ContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props
  switch (schema.tag) {
    case 'primitive-input':
      return (
        <PrimitiveContentInputView
          schema={schema}
          uuid={uuid}
        />
      )
    case 'text-input':
      return (
        <TextContentInputView
          schema={schema}
          uuid={uuid}
        />
      )
    case 'object-input':
      return (
        <ObjectContentInputView
          schema={schema}
          uuid={uuid}
        />
      )
    case 'number-input':
      return (
        <NumberContentInputView
          schema={schema}
          uuid={uuid}
        />
      )
    case 'array-input':
      return (
        <ArrayContentInputView
          schema={schema}
          uuid={uuid}
        />
      )
    default:
      return <UnknownInputView schema={schema} />
  }
})

export type EditorProps = {
  store: EditorStore
  schema: ContentInput
  rootUuid: ContentUuid
}

export const Editor: FunctionComponent<EditorProps> = (props) => {
  const { store, schema, rootUuid } = props
  return (
    <StoreContextProvider store={store}>
      <ContentInputView
        schema={schema}
        uuid={rootUuid}
      />
    </StoreContextProvider>
  )
}
