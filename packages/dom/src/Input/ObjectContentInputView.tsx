import * as React from 'react'
import { FunctionComponent, memo } from 'react'
import { ObjectContentInput } from '@editor/model'
import { useContentByUuid } from '../store.tsx'
import { ContentNotFoundView } from './ContentNotFoundView.tsx'
import { Stack } from '@mui/material'
import { Label } from '../components'
import { ContentInputViewProps, MissingPropertyView } from '../index.tsx'

export const ObjectContentInputView: FunctionComponent<
  ContentInputViewProps<ObjectContentInput>
> = memo((props) => {
  const { schema, uuid, ContentInputView } = props

  const content = useContentByUuid(uuid)

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  return (
    <Stack
      sx={{
        gap: 2,
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Label>Object</Label>
      {Object.entries(schema.fields).map(([key, field]) => {
        const childContent = content.value[key]
        if (!childContent) {
          return <MissingPropertyView propertyName={key} />
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
  )
})
