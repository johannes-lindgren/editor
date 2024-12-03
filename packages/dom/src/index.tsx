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
  Uuid,
  isTextContent,
  isNumberContent,
  ArrayContentInput,
  isArrayContent,
  isPrimitiveContent,
  PrimitiveContentInput,
  Content,
  textInput,
  numberInput,
  primitiveInput,
  objectInput,
  arrayInput,
  subStore,
  cloneContent,
  ContentStore,
} from '@editor/model'
import {
  Label,
  StyledInput,
  CustomNumberInput,
  AnimatedListbox,
  MenuButton,
  MenuItem,
} from './components'
import { v4 as randomUuid } from 'uuid'
import * as React from 'react'
import { createSelector } from 'reselect'
import { Dropdown } from '@mui/base/Dropdown'
import { Menu } from '@mui/base/Menu'

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

const useSelectByUuid = (uuid: Uuid) => {
  return useCallback(
    (store: ContentStore) => {
      return store.data[uuid]
    },
    [uuid],
  )
}

const useContentByUuid = (uuid: Uuid) => {
  const selectByUuid = useSelectByUuid(uuid)
  return useSelector(selectByUuid)
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
  uuid: Uuid
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

export const MissingPropertyView: FunctionComponent<{
  propertyName: string
}> = memo((props) => {
  const { propertyName } = props
  return (
    <Alert severity="error">
      <AlertTitle>Missing property</AlertTitle>
      <Typography>
        The property {propertyName} is missing from the object.
      </Typography>
    </Alert>
  )
})

const PrimitiveContentInputView: FunctionComponent<{
  schema: PrimitiveContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props
  const content = useContentByUuid(uuid)
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
      {schema.label && <Label>{schema.label}</Label>}
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
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props
  const content = useContentByUuid(uuid)
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
      const currentContent = draft.data[uuid]
      if (!isTextContent(currentContent)) {
        return
      }
      draft.data[uuid] = {
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
      {schema.label && <Label>{schema.label}</Label>}
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
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props
  const content = useContentByUuid(uuid)
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
      const currentContent = draft.data[uuid]
      if (!isNumberContent(currentContent)) {
        return
      }
      draft.data[uuid] = {
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
      {schema.label && <Label>{schema.label}</Label>}
      <CustomNumberInput
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
        onChange={handleInput}
      />
    </FormControl>
  )
})

// const OneOfInputView: FunctionComponent<{
//   schema: OneOfContentInput
//   uuid: ContentUuid
// }> = memo((props) => {
//   const { schema, uuid } = props
//   const selectByUuid = useSelectByUuid(uuid)
//   const content = useSelector(selectByUuid)
//   const inputId = useId()
//   const helperTextId = useId()
//   const update = useUpdater()
//   const handleInput: FormEventHandler<
//     HTMLInputElement | HTMLTextAreaElement
//   > = (e) => {
//     // // Must save in a variable because e will become destroyed after the event handler finishes,
//     // //  and the producer callback function might be called later
//     // const value = e.currentTarget.value
//     // update((draft) => {
//     //   const currentContent = draft.data[uuid]
//     //   if (!isOneOfContent(currentContent)) {
//     //     return
//     //   }
//     //   draft.data[uuid] = {
//     //     ...currentContent,
//     //     value,
//     //   }
//     // })
//   }
//
//   if (content === undefined) {
//     return <ContentNotFoundView uuid={uuid} />
//   }
//
//   if (!isOneOfContent(content)) {
//     return (
//       <UnknownContentView
//         content={content}
//         schema={schema}
//       />
//     )
//   }
//
//   return (
//     <FormControl>
//       {schema.label && <Label>{schema.label}</Label>}
//       <Select defaultValue={10}>
//         <Option value={10}>Documentation</Option>
//         {schema.options.map((option) => (
//           <Option>{option.label}</Option>
//         ))}
//       </Select>
//     </FormControl>
//   )
// })

const ObjectContentInputView: FunctionComponent<{
  schema: ObjectContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props

  const content = useContentByUuid(uuid)

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
          return <MissingPropertyView propertyName={key} />
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

const selectStore = (store: ContentStore) => store
const selectUuid = (_: ContentStore, uuid: Uuid) => uuid

const selectContentStoreByUuid = createSelector(
  [selectStore, selectUuid],
  (store: ContentStore, uuid: Uuid) => subStore(store, uuid),
)

const ArrayContentInputView: FunctionComponent<{
  schema: ArrayContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props

  const update = useUpdater()
  const content = useContentByUuid(uuid)

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

  const createHandleMenuClick = (newContent: Content) => {
    return () => {
      update((draft) => {
        const currentContent = draft.data[uuid]
        if (!isArrayContent(currentContent)) {
          return
        }
        if (!newContent) {
          console.log('newContent is undefined')
          return
        }
        const tmpStore: ContentStore = {
          tag: 'content-store',
          rootUuid: newContent.uuid,
          data: {
            [newContent.uuid]: newContent,
          },
        }
        const clonedStore = cloneContent(tmpStore)

        Object.assign(draft.data, clonedStore.data)
        // TODO!!!!! We need the root!
        const valueUuid = Object.keys(clonedStore.data)[0]
        currentContent.value.push({
          tag: 'reference',
          uuid: randomUuid(),
          valueUuid,
        })
      })
    }
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
      {content.value.map((childContent) => (
        <ContentInputViewReferencedSchema
          key={childContent.uuid}
          uuid={childContent.valueUuid}
        />
      ))}
      <Dropdown>
        <MenuButton>Add</MenuButton>
        <Menu slots={{ listbox: AnimatedListbox }}>
          {schema.items.map((item) => (
            <MenuItem
              key={item.uuid}
              onClick={createHandleMenuClick(item)}
            >
              {item.tag}
            </MenuItem>
          ))}
        </Menu>
      </Dropdown>
    </Stack>
  )
})

const ContentInputViewReferencedSchema: FunctionComponent<{
  uuid: Uuid
}> = memo((props) => {
  const { uuid } = props
  const content = useContentByUuid(uuid)
  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }
  return (
    <ContentInputView
      schema={inputFromContent(content)}
      uuid={content.uuid}
    />
  )
})

/**
 * TODO remove... probably. The thing is that we don't want to have to fall back to some defaults
 * The input is not a function of the content, nor does it define what the default content should be.
 * @param content
 */
const inputFromContent = (content: Content): ContentInput => {
  switch (content.tag) {
    case 'text':
      return textInput()
    case 'number':
      return numberInput()
    case 'primitive':
      return primitiveInput()
    case 'object':
      return objectInput()
    case 'array':
      return arrayInput()
  }
}

export const ContentInputView: FunctionComponent<{
  schema: ContentInput
  uuid: Uuid
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
    case 'one-of-input':
      // TODO
      return 'TODO: oneOf'
    // <OneOfInputView
    //   schema={schema}
    //   uuid={uuid}
    // />
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
        // TODO
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
  rootUuid: Uuid
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
