import { styled } from '@mui/system'
import { useFormControlContext } from '@mui/base'
import React from 'react'
import clsx from 'clsx'

export const Label = styled(
  ({
    children,
    className,
  }: {
    children?: React.ReactNode
    className?: string
  }) => {
    const formControlContext = useFormControlContext()
    const [dirty, setDirty] = React.useState(false)

    React.useEffect(() => {
      if (formControlContext?.filled) {
        setDirty(true)
      }
    }, [formControlContext])

    if (formControlContext === undefined) {
      return <p>{children}</p>
    }

    const { error, required, filled } = formControlContext
    const showRequiredError = dirty && required && !filled

    return (
      <p
        className={clsx(className, error || showRequiredError ? 'invalid' : '')}
      >
        {children}
        {required ? ' *' : ''}
      </p>
    )
  },
)`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  margin-bottom: 4px;

  &.invalid {
    color: red;
  }
`
