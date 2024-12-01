import {
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
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
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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
  ContentUuid,
  ContentStore,
  Content,
  isTextContent,
} from '@editor/model'

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
      <InputLabel htmlFor={inputId}>
        {schema.label} ({uuid})
      </InputLabel>
      <OutlinedInput
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
        onChange={handleInput}
      />
    </FormControl>
  )
})

// const NumberContentInputView: FunctionComponent<{
//   schema: NumberContentInput
//   value: NumberContent
//   onUpdate: Updater<NumberContent>
// }> = memo((props) => {
//   const { schema, value, onUpdate } = props
//   const inputId = useId()
//   const helperTextId = useId()
//   const handleInput = (_e, value) => {
//     onUpdate(() => value)
//   }
//   return (
//     <FormControl>
//       <FormHelperText id={helperTextId}>{schema.label}</FormHelperText>
//       <CustomNumberInput
//         id={inputId}
//         aria-describedby={helperTextId}
//         value={value}
//         onChange={handleInput}
//       />
//     </FormControl>
//   )
// })

const ObjectContentInputView: FunctionComponent<{
  schema: ObjectContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props

  const selectByUuid = useSelectByUuid(uuid)
  const value = useSelector(selectByUuid)

  if (value === undefined) {
    return <div>Could not find content by uuid {uuid}</div>
  }

  return (
    <Stack
      gap={1}
      p={2}
    >
      {Object.entries(schema.fields).map(([key, field]) => (
        <ContentInputView
          schema={field}
          key={key}
          uuid={value.value[key].valueUuid}
        />
      ))}
    </Stack>
  )
})

export const ContentInputView: FunctionComponent<{
  schema: ContentInput
  uuid: ContentUuid
}> = memo((props) => {
  const { schema, uuid } = props
  switch (schema.tag) {
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
      return 'todo'
    // return (
    //   <NumberContentInputView
    //     schema={schema}
    //   uuid={uuid}
    //   />
    // )
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
