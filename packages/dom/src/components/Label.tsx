import { styled } from '@mui/system'
import { useFormControlContext } from '@mui/base'
import React from 'react'
import clsx from 'clsx'
import { Typography } from '@mui/material'

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
      return <Typography variant="subtitle2">{children}</Typography>
    }

    const { error, required, filled } = formControlContext
    const showRequiredError = dirty && required && !filled

    return (
      <Typography
        variant="subtitle2"
        className={clsx(className, error || showRequiredError ? 'invalid' : '')}
      >
        {children}
        {required && <span className="required-indicator"> *</span>}
      </Typography>
    )
  },
)(({ theme }) => ({
  '&.invalid': {
    color: theme.palette.error.main,
  },

  '& .required-indicator': {
    color: theme.palette.error.main,
    marginLeft: '2px',
  },
}))
