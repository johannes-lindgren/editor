import * as React from 'react'
import { FunctionComponent, memo } from 'react'
import { ContentInput } from '@editor/model'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { JsonView } from './UnknownContentView.tsx'

export const UnknownInputView: FunctionComponent<{
  schema: ContentInput
}> = memo((props) => {
  const { schema } = props
  return (
    <Alert severity="error">
      <AlertTitle>Unknown input type</AlertTitle>
      <Typography>
        Cannot render the input because the input type is unknown.
      </Typography>
      <Stack>
        <Typography variant="subtitle1">Schema:</Typography>
        <JsonView data={schema} />
      </Stack>
    </Alert>
  )
})
