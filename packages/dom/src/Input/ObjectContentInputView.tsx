import * as React from 'react'
import { FunctionComponent, memo, useState } from 'react'
import { ObjectContentInput } from '@editor/model'
import { useContentByUuid } from '../store.tsx'
import { ContentNotFoundView } from './ContentNotFoundView.tsx'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { ContentInputViewProps, MissingPropertyView } from '../index.tsx'

export const ObjectContentInputView: FunctionComponent<
  ContentInputViewProps<ObjectContentInput>
> = memo((props) => {
  const { schema, uuid, ContentInputView } = props
  const [expanded, setExpanded] = useState(true)

  const content = useContentByUuid(uuid)

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (content.tag !== 'object') {
    return <ContentNotFoundView uuid={uuid} />
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        '&:before': {
          display: 'none',
        },
        boxShadow: 'none',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 48,
          '&.Mui-expanded': {
            minHeight: 48,
          },
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
          },
        }}
      >
        <Typography variant="subtitle2">{schema.label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack
          sx={{
            gap: 2,
          }}
        >
          {Object.entries(schema.fields).map(([key, field]) => {
            const childContent = content.value[key]
            if (!childContent) {
              return (
                <MissingPropertyView
                  key={key}
                  propertyName={key}
                />
              )
            }
            return (
              <ContentInputView
                schema={field}
                key={key}
                uuid={childContent.valueUuid}
                ContentInputView={ContentInputView}
              />
            )
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
})
