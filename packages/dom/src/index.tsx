import {
  Alert,
  AlertTitle,
  Box,
  Divider,
  FormControl,
  Stack,
  Typography,
} from '@mui/material'
import * as React from 'react'
import {
  createContext,
  FormEventHandler,
  Fragment,
  FunctionComponent,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  ArrayContentInput,
  cloneContent,
  Content,
  ContentInput,
  FlatContent,
  FlatStore,
  InputMap,
  isArrayContent,
  isNumberContent,
  isOneOfContent,
  isPrimitiveContent,
  isTextContent,
  NumberContentInput,
  ObjectContentInput,
  OneOfContentInput,
  PrimitiveContentInput,
  subStore,
  TextContentInput,
  Uuid,
} from '@editor/model'
import {
  AnimatedListbox,
  CustomNumberInput,
  Label,
  MenuButton,
  MenuItem,
  Scale,
  StyledInput,
} from './components'
import { v4 as randomUuid } from 'uuid'
import { createSelector } from 'reselect'
import { Dropdown } from '@mui/base/Dropdown'
import { Menu } from '@mui/base/Menu'

type UpdateFn<T> = (draft: T) => void

export type Store<T> = {
  subscribe: (fn: (data: unknown) => void) => () => void
  get: () => T
  update: (fn: UpdateFn<T>) => void
}

export type ContentStore = Store<FlatContent>
export type InputStore = Store<InputMap>

const readOnlyStore = <T,>(data: T): Store<T> => ({
  subscribe: () => () => {},
  get: () => data,
  update: () => {},
})

const ContentYjsStoreContext = createContext<ContentStore | undefined>(
  undefined,
)

const ContentInputYjsStoreContext = createContext<InputStore | undefined>(
  undefined,
)

export const ContentYjsStoreContextProvider: FunctionComponent<{
  store: ContentStore
  children: ReactNode
}> = (props) => {
  const { store, children } = props
  return (
    <ContentYjsStoreContext.Provider value={store}>
      {children}
    </ContentYjsStoreContext.Provider>
  )
}

export const ContentInputYjsStoreContextProvider: FunctionComponent<{
  store: InputStore
  children: ReactNode
}> = (props) => {
  const { store, children } = props
  return (
    <ContentInputYjsStoreContext.Provider value={store}>
      {children}
    </ContentInputYjsStoreContext.Provider>
  )
}

const useUpdater = () => {
  const store = useContext(ContentYjsStoreContext)!
  return store.update
}

export const useSelector = <Selection,>(
  selector: (store: FlatContent) => Selection,
): Selection => {
  const store = useContext(ContentYjsStoreContext)!

  const getSnapshot = useCallback(
    () => selector(store.get()),
    [store, selector],
  )

  return useSyncExternalStore(store.subscribe, getSnapshot)
}

export const useContentInputSelector = <Selection,>(
  selector: (store: InputMap) => Selection,
): Selection => {
  const store = useContext(ContentInputYjsStoreContext)!

  const getSnapshot = useCallback(
    () => selector(store.get()),
    [store, selector],
  )

  return useSyncExternalStore(store.subscribe, getSnapshot)
}

const useSelectByUuid = <T,>(uuid: Uuid) => {
  return useCallback(
    (store: FlatStore<T>) => {
      return store.data[uuid]
    },
    [uuid],
  )
}

const useContentByUuid = (uuid: Uuid) => {
  const selectByUuid = useSelectByUuid<Content>(uuid)
  return useSelector(selectByUuid)
}

const useContentInputByUuid = (uuid: Uuid) => {
  const selectByUuid = useSelectByUuid<ContentInput>(uuid)
  return useContentInputSelector(selectByUuid)
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

export const InputNotFoundView: FunctionComponent<{
  uuid: Uuid
}> = memo((props) => {
  const { uuid } = props
  return (
    <Alert severity="error">
      <AlertTitle>Input not found</AlertTitle>
      <Typography>
        Could not find input by uuid {JSON.stringify(uuid)}
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
        sx={{
          flex: 1,
        }}
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
  const handleInput = (_, value: number | null) => {
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

const OneOfInputView: FunctionComponent<{
  schema: OneOfContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props
  const selectByUuid = useSelectByUuid(uuid)
  const content = useSelector(selectByUuid)
  const inputId = useId()
  const helperTextId = useId()
  const update = useUpdater()

  const handleAdd = (content: FlatContent) => {
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isOneOfContent(currentContent)) {
        return
      }

      Object.assign(draft.data, content.data)
      currentContent.value = {
        tag: 'reference',
        uuid: randomUuid(),
        valueUuid: content.rootUuid,
      }
    })
  }

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isOneOfContent(content)) {
    return (
      <UnknownContentView
        content={content}
        schema={schema}
      />
    )
  }

  return (
    <FormControl>
      <Stack gap={1}>
        <Box
          display="flex"
          justifyContent="space-between"
        >
          {schema.label && <Label>{schema.label}</Label>}
          <SelectContentFromTemplateView
            templates={schema.options}
            onChange={handleAdd}
          />
        </Box>
        <Box
          sx={{
            position: 'relative',
            p: 2,
            pt: 1.5,
          }}
        >
          <ContentInputViewReferencedSchema uuid={content.value.valueUuid} />
        </Box>
      </Stack>
    </FormControl>
  )
})

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
      <Label>Object</Label>
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

const selectStore = (store: FlatContent) => store
const selectUuid = (_: FlatContent, uuid: Uuid) => uuid

const selectContentStoreByUuid = createSelector(
  [selectStore, selectUuid],
  (store: FlatContent, uuid: Uuid) => subStore(store, uuid),
)

const ArrayContentInputView: FunctionComponent<{
  schema: ArrayContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props

  const update = useUpdater()
  const content = useContentByUuid(uuid)

  const [isOpen, setIsOpen] = useState(false)
  const [transitionEndCounter, setTransitionEndCounter] = useState(0)

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

  const handleAdd = (content: FlatContent) => {
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isArrayContent(currentContent)) {
        return
      }

      Object.assign(draft.data, content.data)
      currentContent.value.push({
        tag: 'reference',
        uuid: randomUuid(),
        valueUuid: content.rootUuid,
      })
    })
  }

  const createHandleMenuClick = (contentTemplate: FlatContent) => {
    return () => {
      update((draft) => {
        const currentContent = draft.data[uuid]
        if (!isArrayContent(currentContent)) {
          return
        }
        const clonedStore = cloneContent(contentTemplate)

        Object.assign(draft.data, clonedStore.data)
        currentContent.value.push({
          tag: 'reference',
          uuid: randomUuid(),
          valueUuid: clonedStore.rootUuid,
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
      <SelectContentFromTemplateView
        templates={schema.items}
        onChange={handleAdd}
      >
        Add
      </SelectContentFromTemplateView>
    </Stack>
  )
})

const SelectContentFromTemplateMenu: FunctionComponent<{
  templates: FlatContent[]
  onChange: (content: FlatContent) => void
}> = (props) => {
  const { templates, onChange } = props
  const [transitionEndCounter, setTransitionEndCounter] = useState(0)

  const createHandleMenuClick = (contentTemplate: FlatContent) => {
    return () => {
      onChange(cloneContent(contentTemplate))
    }
  }

  return (
    <Menu
      slots={{
        listbox: AnimatedListbox,
      }}
      onTransitionEnd={() => {
        setTransitionEndCounter((count) => count + 1)
      }}
    >
      {templates.map((template, index) => (
        <Fragment key={template.rootUuid}>
          {index !== 0 && <Divider sx={{ my: 1 }} />}
          <MenuItem
            onClick={createHandleMenuClick(template)}
            sx={{
              width: 200,
              p: 0,
            }}
          >
            <Scale
              scale={3 / 4}
              dependencies={[transitionEndCounter]}
            >
              <ContentPreview template={template} />
            </Scale>
          </MenuItem>
        </Fragment>
      ))}
    </Menu>
  )
}

const SelectContentFromTemplateView: FunctionComponent<{
  templates: FlatContent[]
  onChange: (content: FlatContent) => void
  children?: ReactNode
}> = (props) => {
  const { templates, onChange, children } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dropdown
      open={isOpen}
      onOpenChange={(_, isOpen) => setIsOpen(isOpen)}
    >
      <MenuButton>{children}</MenuButton>
      <SelectContentFromTemplateMenu
        templates={templates}
        onChange={onChange}
      />
    </Dropdown>
  )
}

const ContentPreview: FunctionComponent<{
  template: FlatContent
}> = memo((props) => {
  const { template } = props

  const content = useMemo(() => cloneContent(template), [template])
  const store = useMemo(() => readOnlyStore(content), [content])

  return (
    <ContentYjsStoreContextProvider store={store}>
      <Box
        sx={{
          pointerEvents: 'none',
          p: 2,
        }}
      >
        <ContentInputViewReferencedSchema uuid={content.rootUuid} />
      </Box>
    </ContentYjsStoreContextProvider>
  )
})

export const ContentInputViewReferencedSchema: FunctionComponent<{
  uuid: Uuid
}> = memo((props) => {
  const { uuid } = props
  const content = useContentByUuid(uuid)
  const inputUuid = content?.input?.inputUuid
  const contentInput = useContentInputByUuid(inputUuid ?? '')
  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }
  if (inputUuid === undefined) {
    return `inputUuid on content ${JSON.stringify(uuid)} is undefined`
  }
  if (contentInput === undefined) {
    return <InputNotFoundView uuid={inputUuid} />
  }
  return (
    <ContentInputView
      schema={contentInput}
      uuid={content.uuid}
    />
  )
})

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
      return (
        <OneOfInputView
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
        // TODO
        <ArrayContentInputView
          schema={schema}
          uuid={uuid}
        />
      )
    case 'reference-input':
      return <ContentInputViewReferencedSchema uuid={uuid} />
    default:
      return <UnknownInputView schema={schema} />
  }
})

export type EditorProps = {
  store: ContentStore
  inputStore: InputStore
  schema: ContentInput
  rootUuid: Uuid
}

export const Editor: FunctionComponent<EditorProps> = (props) => {
  const { store, schema, rootUuid, inputStore } = props
  return (
    <ContentYjsStoreContextProvider store={store}>
      <ContentInputYjsStoreContextProvider store={inputStore}>
        <ContentInputView
          schema={schema}
          uuid={rootUuid}
        />
      </ContentInputYjsStoreContextProvider>
    </ContentYjsStoreContextProvider>
  )
}
