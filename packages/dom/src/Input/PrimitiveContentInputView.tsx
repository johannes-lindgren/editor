import * as React from 'react'
import { FunctionComponent, memo, useId } from 'react'
import { isPrimitiveContent, PrimitiveContentInput, Uuid } from '@editor/model'
import { useContentByUuid } from '../store.tsx'
import { FormControl } from '@mui/material'
import { Label, StyledInput } from '../components'
import { ContentNotFoundView } from './ContentNotFoundView.tsx'
import { UnknownContentView } from './UnknownContentView.tsx'

export const PrimitiveContentInputView: FunctionComponent<{
  schema: PrimitiveContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props
  const content = useContentByUuid(uuid)
  const inputId = useId()
  const helperTextId = useId()

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isPrimitiveContent(content)) {
    return (
      <UnknownContentView
        content={content}
        schema={schema}
      />
    )
  }

  return (
    <FormControl>
      {schema.label && <Label>{schema.label}</Label>}
      <StyledInput
        disabled
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
      />
    </FormControl>
  )
})
