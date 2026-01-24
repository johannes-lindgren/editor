import {
  Content,
  ContentInput,
  FlatContent,
  FlatStore,
  InputMap,
  Uuid,
} from '@editor/model'
import * as React from 'react'
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react'

type UpdateFn<T> = (draft: T) => void
export type Store<T> = {
  subscribe: (fn: (data: unknown) => void) => () => void
  get: () => T
  update: (fn: UpdateFn<T>) => void
}
export type ContentStore = Store<FlatContent>
export type InputStore = Store<InputMap>
export const readOnlyStore = <T,>(data: T): Store<T> => ({
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
export const useUpdater = () => {
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
export const useSelectByUuid = <T,>(uuid: Uuid) => {
  return useCallback(
    (store: FlatStore<T>) => {
      return store.data[uuid]
    },
    [uuid],
  )
}
export const useContentByUuid = (uuid: Uuid) => {
  const selectByUuid = useSelectByUuid<Content>(uuid)
  return useSelector(selectByUuid)
}
export const useContentInputByUuid = (uuid: Uuid) => {
  const selectByUuid = useSelectByUuid<ContentInput>(uuid)
  return useContentInputSelector(selectByUuid)
}
