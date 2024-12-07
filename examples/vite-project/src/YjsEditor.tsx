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
  contentInputReference,
  ContentInput,
  InputMap,
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
    referencedText: contentInputReference(basicTextInput),
    paddingTop: numberInput({
      label: 'Padding Top',
    }),
    align: oneOfInput({
      label: 'Alignment',
      options: [
        primitiveInput({
          label: 'Left',
          value: 'left',
        }),
        primitiveInput({
          label: 'Center',
          value: 'center',
        }),
      ],
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
    body2: arrayInput({
      items: [
        {
          tag: 'text',
          uuid: randomUuid(),
          input: contentInputReference(basicTextInput),
          value: 'this is from a template',
        },
        {
          tag: 'text',
          uuid: randomUuid(),
          input: contentInputReference(basicTextInput),
          value: 'this is also from a template',
        },
        {
          tag: 'number',
          uuid: randomUuid(),
          input: contentInputReference(basicNumberInput),
          value: 0,
        },
        {
          tag: 'object',
          uuid: randomUuid(),
          input: contentInputReference(cardInput),
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
      tag: 'primitive',
      uuid: randomUuid(),
      value: 'left',
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
    referencedText: {
      tag: 'text',
      uuid: randomUuid(),
      input: {
        tag: 'reference-input',
        uuid: randomUuid(),
        inputUuid: inputLibrary.basicTextInput.uuid,
      },
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
          input: contentInputReference(basicTextInput),
          value: 'Item 1',
        },
        {
          tag: 'text',
          uuid: randomUuid(),
          input: contentInputReference(basicTextInput),
          value: 'Item 2',
        },
        {
          tag: 'number',
          uuid: randomUuid(),
          input: contentInputReference(basicNumberInput),
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
          store={contentStore}
          inputStore={contentInputStore}
          schema={inputLibrary.pageInput}
          rootUuid={rootUuid}
        />
      </Paper>
      <ContentJsonView store={contentStore} />
    </Box>
  )
}

const ContentJsonView: FunctionComponent<{
  store: ContentStore
}> = (props) => {
  const { store } = props
  return (
    <ContentYjsStoreContextProvider store={store}>
      <ContentJsonViewWithContext />
    </ContentYjsStoreContextProvider>
  )
}

const selectAll = (state: FlatContent) => state

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
          <JsonView data={toTree(state)} />
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
          <JsonView data={toValueOnlyTree(toTree(state))} />
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
