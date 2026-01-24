import {
  Editor,
  ContentStore,
  ContentYjsStoreContextProvider,
  useSelector,
  InputStore,
} from '@editor/dom'
import {
  objectInput,
  textInput,
  numberInput,
  toTree,
  toFlat,
  toValueOnlyTree,
  arrayInput,
  oneOfInput,
  primitiveInput,
  FlatContent,
  inputRef,
  ContentInput,
  InputMap,
} from '@editor/model'
import { createBinder } from 'react-immer-yjs'
import * as Y from 'yjs'
import { FunctionComponent, useState } from 'react'
import {
  AppBar,
  Box,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material'
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'
import { v4 as randomUuid } from 'uuid'

// const contentTemplates: ContentStore = toStore({
//   tag: 'text',
//   uuid: randomUuid(),
//   value: 'this is from a template',
// })

// const defaultTextInput = textInput({
//   label: 'Some text'
// })
// const inputs = [defaultTextInput]

const basicTextInput = textInput({
  label: 'Text',
})
const basicNumberInput = numberInput({
  label: 'Number',
})

const cardInput = objectInput({
  fields: {
    title: textInput({
      label: 'Title',
    }),
    description: textInput({
      label: 'Description',
    }),
  },
})

const numberOrStringInput = oneOfInput({
  label: 'number or string',
  options: [
    {
      tag: 'number',
      uuid: randomUuid(),
      input: inputRef(basicNumberInput),
      value: 123,
    },
    {
      tag: 'text',
      uuid: randomUuid(),
      input: inputRef(basicTextInput),
      value: 'this is also from a template',
    },
  ].map(toFlat),
})

const alignLeftInput = primitiveInput({
  label: 'Left',
  value: 'left',
})
const alignCenterInput = primitiveInput({
  label: 'Center',
  value: 'center',
})
const alignRightInput = primitiveInput({
  label: 'Right',
  value: 'right',
})

const alignInput = oneOfInput({
  label: 'Alignment',
  options: [
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(alignLeftInput),
      value: 'left',
    },
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(alignCenterInput),
      value: 'center',
    },
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(alignRightInput),
      value: 'right',
    },
  ].map(toFlat),
})

const pageInput = objectInput({
  fields: {
    type: primitiveInput({
      label: 'Type',
      value: 'page',
    }),
    title: textInput({
      label: 'Title',
    }),
    description: textInput({
      label: 'Description',
    }),
    numberOrString: inputRef(numberOrStringInput),
    referencedText: inputRef(basicTextInput),
    paddingTop: numberInput({
      label: 'Padding Top',
    }),
    align: alignInput,
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
    body2: arrayInput({
      items: [
        {
          tag: 'text',
          uuid: randomUuid(),
          input: inputRef(basicTextInput),
          value: 'this is from a template',
        },
        {
          tag: 'text',
          uuid: randomUuid(),
          input: inputRef(basicTextInput),
          value: 'this is also from a template',
        },
        {
          tag: 'number',
          uuid: randomUuid(),
          input: inputRef(basicNumberInput),
          value: 0,
        },
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(cardInput),
          value: {
            title: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Title',
            },
            description: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Description',
            },
          },
        },
      ].map(toFlat),
    }),
  },
})

const inputLibrary = {
  pageInput,
  basicNumberInput,
  cardInput,
  basicTextInput: basicTextInput,
  numberOrStringInput,
  alignInput,
  alignLeftInput,
  alignCenterInput,
  alignRightInput,
}

// TODO algorithm that adds uuids
const contentTree = {
  tag: 'object',
  uuid: randomUuid(),
  value: {
    type: {
      tag: 'primitive',
      uuid: randomUuid(),
      value: 'Page',
    },
    align: {
      tag: 'one-of',
      uuid: randomUuid(),
      input: inputRef(inputLibrary.alignInput),
      value: {
        tag: 'primitive',
        uuid: randomUuid(),
        input: inputRef(inputLibrary.alignLeftInput),
        value: 'left',
      },
    },
    title: {
      tag: 'text',
      uuid: randomUuid(),
      value: 'Title',
    },
    description: {
      tag: 'text',
      uuid: randomUuid(),
      value: 'Description',
    },
    numberOrString: {
      tag: 'one-of',
      uuid: randomUuid(),
      input: inputRef(inputLibrary.numberOrStringInput),
      value: {
        tag: 'text',
        uuid: randomUuid(),
        input: inputRef(inputLibrary.basicTextInput),
        value: 'Number or string',
      },
    },
    referencedText: {
      tag: 'text',
      uuid: randomUuid(),
      input: inputRef(inputLibrary.basicTextInput),
      value: 'Referenced text value ',
    },
    paddingTop: {
      tag: 'number',
      uuid: randomUuid(),
      value: 10,
    },
    body: {
      tag: 'object',
      uuid: randomUuid(),
      value: {
        title: {
          tag: 'text',
          uuid: randomUuid(),
          value: 'Title',
        },
        description: {
          tag: 'text',
          uuid: randomUuid(),
          value: 'Description',
        },
      },
    },
    body2: {
      tag: 'array',
      uuid: randomUuid(),
      value: [
        {
          tag: 'text',
          uuid: randomUuid(),
          input: inputRef(basicTextInput),
          value: 'Item 1',
        },
        {
          tag: 'text',
          uuid: randomUuid(),
          input: inputRef(basicTextInput),
          value: 'Item 2',
        },
        {
          tag: 'number',
          uuid: randomUuid(),
          input: inputRef(basicNumberInput),
          value: 100,
        },
      ],
    },
  },
}

const toInputMap = (library: Record<string, ContentInput>): InputMap => ({
  tag: 'content-input-store',
  data: Object.fromEntries(
    Object.entries(library).map(([_key, value]) => [value.uuid, value]),
  ),
})

const rootUuid = contentTree.uuid
const defaultContent: FlatContent = toFlat(contentTree)
const defaultInput: InputMap = toInputMap(inputLibrary)

const contentStore: ContentStore = createBinder(
  new Y.Doc().getMap('content'),
  defaultContent,
)

const contentInputStore: InputStore = createBinder(
  new Y.Doc().getMap('contentInput'),
  defaultInput,
)

export const YjsEditor = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Editor
          </Typography>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="end"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
          pt: 10,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 960,
          }}
        >
          <ContentJsonView
            store={contentStore}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <Paper
            sx={{
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              component="div"
            >
              Content Editor
            </Typography>
            <Editor
              store={contentStore}
              inputStore={contentInputStore}
              schema={inputLibrary.pageInput}
              rootUuid={rootUuid}
            />
          </Paper>
        </Box>
      </Box>
    </>
  )
}

const ContentJsonView: FunctionComponent<{
  store: ContentStore
  open: boolean
  onClose: () => void
}> = (props) => {
  const { store, open, onClose } = props
  return (
    <ContentYjsStoreContextProvider store={store}>
      <ContentJsonViewWithContext
        open={open}
        onClose={onClose}
      />
    </ContentYjsStoreContextProvider>
  )
}

const selectAll = (state: FlatContent) => state

const ContentJsonViewWithContext: FunctionComponent<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const state = useSelector(selectAll)
  const [tabValue, setTabValue] = useState(0)

  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 360,
        maxWidth: '90vw',
        bgcolor: 'background.paper',
        boxShadow: 4,
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">Data Inspector</Typography>
        <IconButton
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tab label="Source" />
        <Tab label="Tree" />
        <Tab label="Value-only" />
      </Tabs>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        {tabValue === 0 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                color: 'text.secondary',
              }}
            >
              The data is stored in a key-value database that maps content UUID
              to: content
            </Typography>
            <JsonView data={state} />
          </Stack>
        )}
        {tabValue === 1 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                color: 'text.secondary',
              }}
            >
              The data can be transformed into a tree structure, which can be
              easier to work with:
            </Typography>
            <JsonView data={toTree(state)} />
          </Stack>
        )}
        {tabValue === 2 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                color: 'text.secondary',
              }}
            >
              The tree-representation can be further simplified by recursively
              extracting the value:
            </Typography>
            <JsonView data={toValueOnlyTree(toTree(state))} />
          </Stack>
        )}
      </Box>
    </Box>
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
        p: 2,
      }}
    >
      <Box component="code">{JSON.stringify(data, null, 2)}</Box>
    </Box>
  )
}
