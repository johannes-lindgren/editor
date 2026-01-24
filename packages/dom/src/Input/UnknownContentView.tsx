import * as React from 'react'
import { FunctionComponent, memo } from 'react'
import { ContentInput } from '@editor/model'
import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material'

export const JsonView: FunctionComponent<{ data: unknown }> = (props) => {
  const { data } = props
  return (
    <Box
      component="pre"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        px: 2,
        py: 1,
      }}
    >
      <Box component="code">{JSON.stringify(data, null, 2)}</Box>
    </Box>
  )
}

export const UnknownContentView: FunctionComponent<{
  schema: ContentInput
  content: unknown
}> = memo((props) => {
  const { schema, content } = props
  return (
    <Alert severity="error">
      <AlertTitle>
        The content does not adhere to the expected structure.
      </AlertTitle>
      <Typography>
        The schema expects the content to be of the following structure:
      </Typography>
      <Stack>
        <Typography variant="subtitle1">Schema:</Typography>
        <JsonView data={schema} />
        <Typography variant="subtitle1">Content:</Typography>
        <JsonView data={content} />
      </Stack>
    </Alert>
  )
})
