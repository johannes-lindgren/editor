import { FunctionComponent } from 'react'
import { Box } from '@mui/material'
import { JsonView as JsonViewLib } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

const basicChildStyle = 'json-child-fields'

export const JsonView: FunctionComponent<{ data: unknown }> = (props) => {
  const { data } = props
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        bgcolor: 'background.paper',
        color: 'text.primary',
        '& *': {
          backgroundColor: 'transparent !important',
          color: 'inherit',
        },
        [`& .${basicChildStyle}`]: {
          fontWeight: 'normal',
        },
      }}
    >
      <JsonViewLib
        style={{
          basicChildStyle,
        }}
        data={data as object}
        shouldExpandNode={(level) => level < 2}
      />
    </Box>
  )
}
