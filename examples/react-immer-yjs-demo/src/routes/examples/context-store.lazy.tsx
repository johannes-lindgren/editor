import { FunctionComponent, FormEventHandler } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { State, useSelector } from 'react-immer-yjs/src/hooks.ts'
import { useYjsStore, YjsContextProvider } from 'react-immer-yjs'

type StatePayload = {
  title: string
}

const initialState: StatePayload = {
  title: 'Hello, this is a title!',
}

const AppWithContext = () => {
  return (
    <YjsContextProvider initialState={initialState}>
      <Child />
      <AsJson />
    </YjsContextProvider>
  )
}

const getState = (state: State<StatePayload>) => state

const AsJson = () => {
  const store = useYjsStore<StatePayload>()
  const state = useSelector(store, getState)
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}

const Child = () => {
  const store = useYjsStore<StatePayload>()
  const state = useSelector(store, getState)

  const handleInitialize = () => {
    store.tag === 'initialized' &&
      store.binder.update((state) => {
        Object.assign(state, {
          title: 'Hello, this!',
        } satisfies StatePayload)
      })
  }

  switch (store.tag) {
    case 'initialized':
      return <Initialized state={state} update={store.binder.update} />
    case 'uninitialized':
      console.log('loading')
      return <Loading onInitialize={handleInitialize} />
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
  state: StatePayload
  update: (fn: (draft: StatePayload) => void) => void
}> = (props) => {
  const { state, update } = props
  const handleTitleInput: FormEventHandler<HTMLInputElement> = (e) => {
    const value = e.currentTarget.value
    update((draft) => {
      draft.title = value
    })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>{state.title}</div>
      <input value={state.title} onInput={handleTitleInput} />
    </div>
  )
}

export const Route = createLazyFileRoute('/examples/context-store')({
  component: Index,
})

function Index() {
  return <AppWithContext />
}
