import * as React from 'react'
import clsx from 'clsx'
import { styled } from '@mui/system'
import { useButton } from '@mui/base/useButton'
import { ButtonProps } from '@mui/base/Button'

export const Button = React.forwardRef(function CustomButton(
  props: ButtonProps,
  ref: React.ForwardedRef<any>,
) {
  const { children, disabled } = props
  const { active, focusVisible, getRootProps } = useButton({
    ...props,
    rootRef: ref,
  })

  return (
    <CustomButtonRoot
      {...getRootProps()}
      className={clsx({
        active,
        disabled,
        focusVisible,
      })}
    >
      <CustomButtonInner
        className={clsx({
          active,
          disabled,
          focusVisible,
        })}
      >
        {children}
      </CustomButtonInner>
    </CustomButtonRoot>
  )
})

const blue = {
  200: '#99CCFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0066CC',
}

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
}

const CustomButtonRoot = styled('button')(
  ({ theme }) => `
  border: 0;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: #f1f1f1;
  padding: 4px;
  border-radius: 8px;
  line-height: 1.5;
  transition: all 150ms ease;
  cursor: pointer;
  display: flex;
  box-shadow: inset 5px 5px 26px rgba(0, 0, 0, 0.2), inset -5px -5px 8px rgba(255, 255, 255, 0.7);
  align-items: stretch;
  justify-content: flex-end;
  flex-direction: column;
`,
)

const CustomButtonInner = styled('div')(
  ({ theme }) => `
  
    padding: 8px 16px;
    border: 0;
    transition: all 0.2s;
    flex: 1;
    background: white;
    border-radius: 4px;
    box-shadow: inset 0px 0px 0px rgba(0, 0, 0, 0.2), inset -10px 0px 0px rgba(255, 255, 255, 0.7);
  
  &.active {
    box-shadow: inset -4px -4px 0px rgba(0, 0, 0, 0.2), inset 4px 4px 0px rgba(0, 0, 0, 0.2);
  }
`,
)
