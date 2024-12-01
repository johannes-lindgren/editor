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
} from '@editor/model'
import { createBinder } from 'react-immer-yjs'
import * as Y from 'yjs'
import { FunctionComponent } from 'react'
import { Box, Stack } from '@mui/material'

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
    // paddingTop: numberInput({
    //   label: 'Padding Top',
    // }),
    // body: objectInput({
    //   fields: {
    //     title: textInput({
    //       label: 'Title',
    //     }),
    //     description: textInput({
    //       label: 'Description',
    //     }),
    //   },
    // }),
  },
})

const defaultContent: Record<ContentUuid, Content> = {
  '0': {
    tag: 'object',
    uuid: '0',
    value: {
      title: {
        tag: 'reference',
        uuid: '0.0',
        valueUuid: '1',
      },
      description: {
        tag: 'reference',
        uuid: '0.1',
        valueUuid: '2',
      },
    },
  },
  '1': {
    tag: 'text',
    uuid: '1',
    value: 'Default title',
  },
  '2': {
    tag: 'text',
    uuid: '2',
    value: 'Default description',
  },
}

const store: EditorStore = createBinder(
  new Y.Doc().getMap('content'),
  defaultContent,
)

export const YjsEditor = () => {
  return (
    <Stack>
      <Editor
        store={store}
        schema={objectSchema}
        rootUuid="0"
      />
      <ContentJsonView store={store} />
    </Stack>
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
    <Box
      component="pre"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <code>{JSON.stringify(state, null, 2)}</code>
    </Box>
  )
}
