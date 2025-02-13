import { bind, Binder, Snapshot } from 'immer-yjs'
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
import * as Y from 'yjs'

export const createBinder = <T extends Snapshot>(
  source: Y.Map<unknown> | Y.Array<unknown>,
  initialState: T,
): Binder<T> => {
  const binder = bind<T>(source)
  binder.update((state) => {
    Object.assign(state, initialState)
  })
  return binder
}

export const useDoc = () => {
  return useMemo(() => new Y.Doc(), [])
}

export const useDocMap = (doc: Y.Doc, key: string) => {
  return useMemo(() => doc.getMap(key), [doc, key])
}

const useBinder = <T extends Snapshot>(initialState: T): Binder<T> => {
  return useMemo(() => {
    const doc = new Y.Doc()
    const rootProp = doc.getMap('state')
    return createBinder(rootProp, initialState)
  }, [initialState])
}

export const useStore = <T extends Snapshot>(initialState: T): Store<T> => {
  const binder = useBinder(initialState)

  return useMemo(() => ({ tag: 'initialized', binder }), [binder])
}

export type Store<T extends Snapshot> =
  | {
      tag: 'initialized'
      binder: Binder<T>
    }
  | {
      tag: 'uninitialized'
    }

export type State<T extends Snapshot> =
  | {
      tag: 'initialized'
      value: T
    }
  | {
      tag: 'uninitialized'
    }

export const createUseSelector =
  <T extends Snapshot>(store: Store<T>) =>
  <Selection>(selector: (state: State<T>) => Selection): Selection =>
    useSelector(store, selector)

const defaultSubscribe = () => () => {}

export const useSelector = <T extends Snapshot, Selection>(
  store: Store<T>,
  selector: (state: State<T>) => Selection,
): Selection => {
  const lastSnapshotRef = useRef<T>()
  const lastStateRef = useRef<State<T>>({
    tag: 'uninitialized',
  })

  const binder = useMemo(
    () => (store.tag === 'initialized' ? store.binder : undefined),
    [store],
  )

  const getSnapshot = useCallback(() => {
    const currentSnapshot = binder ? binder.get() : undefined

    // Compare with the previous snapshot to prevent unnecessary changes
    if (currentSnapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = currentSnapshot
      lastStateRef.current = currentSnapshot
        ? { tag: 'initialized', value: currentSnapshot }
        : { tag: 'uninitialized' }
    }

    return selector(lastStateRef.current)
  }, [])

  return useSyncExternalStore(
    binder ? binder.subscribe : defaultSubscribe,
    getSnapshot,
  )
}
