import { Store, useStore } from './hooks.ts'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { Snapshot } from 'immer-yjs'

const StoreContext = createContext<Store<Snapshot>>({
  tag: 'uninitialized',
})

export type YjsContextProviderProps<T extends Snapshot> = {
  initialState: T
  children: ReactNode
}

export const YjsContextProvider = <T extends Snapshot>(
  props: YjsContextProviderProps<T>,
) => {
  const store = useStore<T>(props.initialState)
  const value: Store<T> = useMemo(() => store, [store])
  return (
    <StoreContext.Provider value={value}>
      {props.children}
    </StoreContext.Provider>
  )
}

export const useYjsStore = <T extends Snapshot>(): Store<T> => {
  return useContext(StoreContext) as Store<T>
}
