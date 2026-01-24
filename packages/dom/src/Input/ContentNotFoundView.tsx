import * as React from 'react'
import { FunctionComponent, memo } from 'react'
import { Uuid } from '@editor/model'
import { Alert, AlertTitle, Typography } from '@mui/material'

export const ContentNotFoundView: FunctionComponent<{
  uuid: Uuid
}> = memo((props) => {
  const { uuid } = props
  return (
    <Alert severity="error">
      <AlertTitle>Content not found</AlertTitle>
      <Typography>
        Could not find content by uuid {JSON.stringify(uuid)}
      </Typography>
    </Alert>
  )
})
