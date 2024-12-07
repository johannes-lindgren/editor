import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

export const Scale: FunctionComponent<{
  scale: number
  children: ReactNode
  dependencies?: unknown[]
}> = (props) => {
  const { scale, children, dependencies = [] } = props
  const rootEl = useRef<HTMLDivElement>(null)
  const innerEl = useRef<HTMLDivElement>(null)
  const [rootDim, setRootDim] = useState<{ width?: number; height?: number }>(
    {},
  )
  const [innerDim, setInnerDim] = useState<{ width?: number; height?: number }>(
    {},
  )

  const callback = () => {
    requestAnimationFrame(() => {
      const rootRect = rootEl.current?.getBoundingClientRect()
      const innerRect = innerEl.current?.getBoundingClientRect()
      // console.log('rootEl', rootEl.current)
      // console.log('innerEl', innerEl.current)
      // console.log('rootRect', rootRect)
      // console.log('innerRect', rootRect)
      setRootDim({
        width: rootRect?.width || undefined,
        height: rootRect?.height || undefined,
      })
      setInnerDim({
        width: innerRect?.width || undefined,
        height: innerRect?.height || undefined,
      })
    })
  }

  useLayoutEffect(() => {
    callback()
  }, dependencies)

  useLayoutEffect(() => {
    if (!innerEl.current || !rootEl.current) {
      return
    }

    const handleTransitionEnd = () => {
      console.log('transition end')
      callback()
    }

    const resizeObserver = new ResizeObserver(callback)
    callback()

    // rootEl.current.addEventListener('transitionend', handleTransitionEnd)

    // Start observing
    console.log('observing', rootEl.current)
    // resizeObserver.observe(rootEl.current)

    return () => {
      // Cleanup on unmount
      console.log('disc')
      resizeObserver.disconnect()
      rootEl.current?.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [])
  return (
    <div ref={rootEl}>
      <div
        className="root"
        style={{
          height: innerDim?.height,
          overflow: 'hidden',
        }}
      >
        <div
          className="inner"
          ref={innerEl}
          style={{
            boxSizing: 'border-box',
            transform: `scale(${scale.toString(10)})`,
            transformOrigin: 'top left',
            width: (rootDim?.width ?? 0) / scale,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
