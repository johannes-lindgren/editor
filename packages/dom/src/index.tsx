import {
  Alert,
  AlertTitle,
  Box,
  Divider,
  FormControl,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import * as React from 'react'
import {
  Fragment,
  FunctionComponent,
  memo,
  ReactNode,
  useId,
  useMemo,
  useState,
} from 'react'
import {
  Add as AddIcon,
  SwapHoriz as SwapIcon,
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material'
import { Reorder } from 'motion/react'
import {
  ArrayContentInput,
  cloneContent,
  ContentInput,
  ContentReference,
  FlatContent,
  isArrayContent,
  isOneOfContent,
  OneOfContentInput,
  subStore,
  Uuid,
} from '@editor/model'
import {
  AnimatedListbox,
  Label,
  MenuButton,
  MenuItem,
  Scale,
} from './components'
import { v4 as randomUuid } from 'uuid'
import { createSelector } from 'reselect'
import { Dropdown } from '@mui/base/Dropdown'
import { Menu } from '@mui/base'
import {
  ContentInputYjsStoreContextProvider,
  ContentStore,
  ContentYjsStoreContextProvider,
  InputStore,
  readOnlyStore,
  useContentByUuid,
  useContentInputByUuid,
  useSelectByUuid,
  useSelector,
  useUpdater,
} from './store.tsx'
import {
  ContentNotFoundView,
  NumberContentInputView,
  ObjectContentInputView,
  PrimitiveContentInputView,
  TextContentInputView,
  UnknownContentView,
  UnknownInputView,
} from './Input'

export type ContentInputViewProps<Schema> = {
  schema: Schema
  uuid: Uuid
  ContentInputView?: FunctionComponent<ContentInputViewProps<ContentInput>>
}

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

const OneOfInputView: FunctionComponent<
  ContentInputViewProps<OneOfContentInput>
> = memo((props) => {
  const { schema, uuid, ContentInputView } = props
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
          >
            <SwapIcon fontSize="inherit" />
          </SelectContentFromTemplateView>
        </Box>
        <Box
          sx={{
            position: 'relative',
          }}
        >
          <ContentInputViewReferencedSchema
            uuid={content.value.valueUuid}
            ContentInputView={ContentInputView || ContentInputViewInternal}
          />
        </Box>
      </Stack>
    </FormControl>
  )
})

const selectStore = (store: FlatContent) => store
const selectUuid = (_: FlatContent, uuid: Uuid) => uuid

const selectContentStoreByUuid = createSelector(
  [selectStore, selectUuid],
  (store: FlatContent, uuid: Uuid) => subStore(store, uuid),
)

const ArrayItemWrapper: FunctionComponent<{
  children: ReactNode
  value: ContentReference
  index: number
  total: number
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}> = memo((props) => {
  const { children, value, index, total, onRemove, onMoveUp, onMoveDown } =
    props
  return (
    <Reorder.Item
      value={value}
      style={{
        listStyle: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
          borderRadius: 1,
        }}
      >
        <DragIndicatorIcon
          fontSize="small"
          sx={{
            mt: 1,
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
            color: (theme) => theme.palette.text.secondary,
          }}
          style={{ touchAction: 'none' }}
        />
        <Box
          display="flex"
          flex={1}
        >
          {children}
        </Box>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 0.5 }}
        >
          <IconButton
            size="small"
            onClick={onMoveUp}
            disabled={index === 0}
            sx={{
              padding: '4px',
            }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onMoveDown}
            disabled={index === total - 1}
            sx={{
              padding: '4px',
            }}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onRemove}
            color="default"
            sx={{
              padding: '4px',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Reorder.Item>
  )
})

const ArrayContentInputView: FunctionComponent<
  ContentInputViewProps<ArrayContentInput>
> = memo((props) => {
  const { schema, uuid, ContentInputView } = props

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

  const handleReorder = (newOrder: ContentReference[]) => {
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isArrayContent(currentContent)) {
        return
      }
      currentContent.value = newOrder
    })
  }

  const handleRemove = (index: number) => {
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isArrayContent(currentContent)) {
        return
      }
      currentContent.value.splice(index, 1)
    })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isArrayContent(currentContent)) {
        return
      }
      const item = currentContent.value[index]
      currentContent.value.splice(index, 1)
      currentContent.value.splice(index - 1, 0, item)
    })
  }

  const handleMoveDown = (index: number) => {
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isArrayContent(currentContent)) {
        return
      }
      if (index >= currentContent.value.length - 1) return
      const item = currentContent.value[index]
      currentContent.value.splice(index, 1)
      currentContent.value.splice(index + 1, 0, item)
    })
  }

  return (
    <Stack
      sx={{
        gap: 2,
        // p: 2,
        // border: 1,
        // borderColor: 'divider',
        // borderRadius: 1,
      }}
    >
      <Box
        component={Reorder.Group}
        axis="y"
        values={content.value}
        onReorder={handleReorder}
        sx={{
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {content.value.map((childContent, index) => (
          <ArrayItemWrapper
            key={childContent.uuid}
            value={childContent}
            index={index}
            total={content.value.length}
            onRemove={() => handleRemove(index)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
          >
            <ContentInputViewReferencedSchema
              uuid={childContent.valueUuid}
              ContentInputView={ContentInputView || ContentInputViewInternal}
            />
          </ArrayItemWrapper>
        ))}
      </Box>
      <Box
        display="inherit"
        justifyContent="flex-start"
      >
        <SelectContentFromTemplateView
          templates={schema.items}
          onChange={handleAdd}
        >
          <AddIcon fontSize="inherit" />
        </SelectContentFromTemplateView>
      </Box>
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
      <MenuButton
        sx={{
          fontSize: (theme) => theme.typography.pxToRem(16),
          minWidth: 'auto',
          padding: '8px',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'primary.main',
          },
        }}
      >
        {children}
      </MenuButton>
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
  ContentInputView?: FunctionComponent<ContentInputViewProps<ContentInput>>
}> = memo((props) => {
  const { uuid, ContentInputView = ContentInputViewInternal } = props
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

const ContentInputViewInternal: FunctionComponent<
  ContentInputViewProps<ContentInput>
> = memo((props) => {
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
          ContentInputView={ContentInputViewInternal}
        />
      )
    case 'object-input':
      return (
        <ObjectContentInputView
          schema={schema}
          uuid={uuid}
          ContentInputView={ContentInputViewInternal}
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
          ContentInputView={ContentInputViewInternal}
        />
      )
    case 'reference-input':
      return (
        <ContentInputViewReferencedSchema
          uuid={uuid}
          ContentInputView={ContentInputViewInternal}
        />
      )
    default:
      return <UnknownInputView schema={schema} />
  }
})

export const ContentInputView: FunctionComponent<
  ContentInputViewProps<ContentInput>
> = memo((props) => {
  const { schema, uuid, ContentInputView: RecursiveView } = props
  const View = RecursiveView || ContentInputViewInternal
  return (
    <View
      schema={schema}
      uuid={uuid}
    />
  )
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

export * from './store.tsx'
