import {
  Editor,
  EditorStore,
  StoreContextProvider,
  useSelector,
} from '@editor/dom'
import {
  objectInput,
  textInput,
  ContentStore,
  ContentUuid,
  Content,
  ContentReference,
  numberInput,
  toTree,
  toStore,
  toValueOnlyTree,
} from '@editor/model'
import { createBinder } from 'react-immer-yjs'
import * as Y from 'yjs'
import { FunctionComponent } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { v4 as randomUuid } from 'uuid'

const textSchema = textInput({
  label: 'Title',
})

const objectSchema = objectInput({
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
})

const contentTree = {
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
  },
}

const rootUuid = contentTree.uuid
const defaultContent: ContentStore = toStore(contentTree)

const store: EditorStore = createBinder(
  new Y.Doc().getMap('content'),
  defaultContent,
)

export const YjsEditor = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
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
          Editor
        </Typography>
        <Editor
          store={store}
          schema={objectSchema}
          rootUuid={rootUuid}
        />
      </Paper>
      <ContentJsonView store={store} />
    </Box>
  )
}

const ContentJsonView: FunctionComponent<{
  store: EditorStore
}> = (props) => {
  const { store } = props
  return (
    <StoreContextProvider store={store}>
      <ContentJsonViewWithContext />
    </StoreContextProvider>
  )
}

const selectAll = (state: ContentStore) => state

const ContentJsonViewWithContext = () => {
  const state = useSelector(selectAll)
  return (
    <Stack>
      <Accordion>
        <AccordionSummary>
          <Typography variant="subtitle1">Source</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            sx={{
              color: 'text.secondary',
            }}
          >
            The data is stored in a key-value database that maps content UUID
            to: content
          </Typography>
          <JsonView data={state} />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <Typography variant="subtitle1">Tree</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            sx={{
              color: 'text.secondary',
            }}
          >
            The data can be transformed into a tree structure, which can be
            easier to work with:
          </Typography>
          <JsonView data={toTree(state, rootUuid)} />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <Typography variant="subtitle1">Value-only Tree</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            sx={{
              color: 'text.secondary',
            }}
          >
            The tree-representation can be further simplified by recursively
            extracting the value:
          </Typography>
          <JsonView data={toValueOnlyTree(toTree(state, rootUuid))} />
        </AccordionDetails>
      </Accordion>
    </Stack>
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
