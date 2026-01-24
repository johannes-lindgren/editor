import * as React from 'react'
import { FormEventHandler, FunctionComponent, memo, useId } from 'react'
import { isTextContent, TextContentInput, Uuid } from '@editor/model'
import { useContentByUuid, useUpdater } from '../store.tsx'
import { UnknownContentView } from './UnknownContentView.tsx'
import { FormControl } from '@mui/material'
import { Label, StyledInput } from '../components'

import { ContentNotFoundView } from './ContentNotFoundView.tsx'

export const TextContentInputView: FunctionComponent<{
  schema: TextContentInput
  uuid: Uuid
}> = memo((props) => {
  const { schema, uuid } = props
  const content = useContentByUuid(uuid)
  const inputId = useId()
  const helperTextId = useId()
  const update = useUpdater()
  const handleInput: FormEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    // Must save in a variable because e will become destroyed after the event handler finishes,
    //  and the producer callback function might be called later
    const value = e.currentTarget.value
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isTextContent(currentContent)) {
        return
      }
      draft.data[uuid] = {
        ...currentContent,
        value,
      }
    })
  }

  if (content === undefined) {
    return <ContentNotFoundView uuid={uuid} />
  }

  if (!isTextContent(content)) {
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
        sx={{
          flex: 1,
        }}
        label={schema.label}
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
        onChange={handleInput}
      />
    </FormControl>
  )
})
