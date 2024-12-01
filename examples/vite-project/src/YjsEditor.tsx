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
} from '@editor/model'
import { createBinder } from 'react-immer-yjs'
import * as Y from 'yjs'
import { FunctionComponent } from 'react'
import { Box, Stack } from '@mui/material'
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

export type ContentTree = unknown

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

const flattenContent = (content: ContentTree): ContentStore => {
  const result: Record<ContentUuid, Content> = {}

  switch (content.tag) {
    case 'text':
      result[content.uuid] = content
      break
    case 'number':
      result[content.uuid] = content
      break
    case 'object':
      result[content.uuid] = {
        tag: 'object',
        uuid: content.uuid,
        value: Object.entries(content.value).reduce(
          (acc, [key, child]) => {
            const m = flattenContent(child)
            Object.assign(result, m)
            acc[key] = {
              tag: 'reference',
              uuid: randomUuid(),
              valueUuid: child.uuid,
            }
            return acc
          },
          {} as Record<ContentUuid, ContentReference>,
        ),
      }
      break
  }
  return result
}

const unflattenContent = (
  content: ContentStore,
  rootUuid: ContentUuid,
): ContentTree => {
  const root = content[rootUuid]
  switch (root.tag) {
    case 'text':
      return root
    case 'number':
      return root
    case 'object':
      return {
        tag: 'object',
        uuid: root.uuid,
        value: Object.entries(root.value).reduce(
          (acc, [key, ref]) => {
            acc[key] = unflattenContent(content, ref.valueUuid)
            return acc
          },
          {} as Record<string, ContentTree>,
        ),
      }
  }
}

const rootUuid = contentTree.uuid
const defaultContent: ContentStore = flattenContent(contentTree)

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
        rootUuid={rootUuid}
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
      <code>{JSON.stringify(unflattenContent(state, rootUuid), null, 2)}</code>
    </Box>
  )
}
