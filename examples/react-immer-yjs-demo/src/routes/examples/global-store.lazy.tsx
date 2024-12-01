import { bind, Snapshot } from 'immer-yjs'
import * as Y from 'yjs'
import { createLazyFileRoute } from '@tanstack/react-router'
import { FunctionComponent } from 'react'
import { createUseSelector, Store } from 'react-immer-yjs/src/hooks.ts'

type AppState =
  | {
      tag: 'initialized'
      state: string
    }
  | {
      tag: 'uninitialized'
    }
  | {
      tag: 'failure'
      message: string
    }

export const createGlobalStore = <T extends Snapshot>(
  source: Y.Map<unknown>,
): Store<T> => {
  const binder = bind<T>(source)
  binder.update((state) => {
    Object.assign(state, {
      tag: 'uninitialized',
    })
  })
  return { binder }
}

const globalDoc = new Y.Doc()
const globalRootProp = globalDoc.getMap('state')
const store = createGlobalStore<AppState>(globalRootProp)
const useAppSelector = createUseSelector(store)

const getState = (state: AppState) => state
const AppWithGlobalStore = () => {
  const state = useAppSelector(getState)
  const handleInitialize = () => {
    store.binder.update((state) => {
      console.log('updating')
      Object.assign(state, {
        tag: 'initialized',
        state: 'Hello, world!',
      })
    })
  }
  switch (state.tag) {
    case 'initialized':
      return <Initialized state={state} />
    case 'uninitialized':
      return <Loading onInitialize={handleInitialize} />
    case 'failure':
      return <Failure />
  }
}

const Loading: FunctionComponent<{
  onInitialize: () => void
}> = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <button onClick={props.onInitialize}>Initialize</button>
      <div>Loading...</div>
    </div>
  )
}
const Failure = () => <div>Failed to load :(</div>
const Initialized: FunctionComponent<{
  state: Extract<
    AppState,
    {
      tag: 'initialized'
    }
  >
}> = (props) => {
  return <div>{props.state.state}</div>
}

export const Route = createLazyFileRoute('/examples/global-store')({
  component: Index,
})

function Index() {
  return <AppWithGlobalStore />
}
