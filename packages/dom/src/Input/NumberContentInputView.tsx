import * as React from 'react'
import { FunctionComponent, memo, useId } from 'react'
import { isNumberContent, NumberContentInput } from '@editor/model'
import { useContentByUuid, useUpdater } from '../store.tsx'
import { ContentNotFoundView } from './ContentNotFoundView.tsx'
import { UnknownContentView } from './UnknownContentView.tsx'
import { FormControl } from '@mui/material'
import { CustomNumberInput, Label } from '../components'
import { ContentInputViewProps } from '../index.tsx'

export const NumberContentInputView: FunctionComponent<
  ContentInputViewProps<NumberContentInput>
> = memo((props) => {
  const { schema, uuid } = props
  const content = useContentByUuid(uuid)
  const inputId = useId()
  const helperTextId = useId()
  const update = useUpdater()
  const handleInput = (_, value: number | null) => {
    // Must save in a variable because e will become destroyed after the event handler finishes,
    //  and the producer callback function might be called later
    if (value === null) {
      return
    }
    update((draft) => {
      const currentContent = draft.data[uuid]
      if (!isNumberContent(currentContent)) {
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

  if (!isNumberContent(content)) {
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
      <CustomNumberInput
        id={inputId}
        aria-describedby={helperTextId}
        value={content.value}
        onChange={handleInput}
      />
    </FormControl>
  )
})
