import {
  ContentStore,
  ContentYjsStoreContextProvider,
  Editor,
  InputStore,
  useSelector,
} from '@editor/dom'
import {
  arrayInput,
  ContentInput,
  FlatContent,
  InputMap,
  inputRef,
  numberInput,
  objectInput,
  oneOfInput,
  primitiveInput,
  textInput,
  toFlat,
  toTree,
  toValueOnlyTree,
} from '@editor/model'
import { createBinder } from 'react-immer-yjs'
import * as Y from 'yjs'
import { FunctionComponent, useState } from 'react'
import {
  AppBar,
  Box,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material'
import { Close as CloseIcon, Menu as MenuIcon } from '@mui/icons-material'
import { v4 as randomUuid } from 'uuid'
import { JsonView } from './JsonView.tsx'

// Basic inputs
const basicTextInput = textInput({})
const basicNumberInput = numberInput({})

// Button variants
const buttonPrimaryVariant = primitiveInput({ value: 'primary' })
const buttonSecondaryVariant = primitiveInput({ value: 'secondary' })
const buttonOutlineVariant = primitiveInput({ value: 'outline' })

const buttonVariantInput = oneOfInput({
  label: 'Button Variant',
  options: [
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(buttonPrimaryVariant),
      value: 'primary',
    },
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(buttonSecondaryVariant),
      value: 'secondary',
    },
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(buttonOutlineVariant),
      value: 'outline',
    },
  ].map(toFlat),
})

// Button component
const buttonInput = objectInput({
  label: 'Button',
  fields: {
    text: textInput({
      label: 'Button Text',
    }),
    url: textInput({
      label: 'URL',
    }),
    variant: buttonVariantInput,
  },
})

// Image component
const imageInput = objectInput({
  label: 'Image',
  fields: {
    src: textInput({
      label: 'Image URL',
    }),
    alt: textInput({
      label: 'Alt Text',
    }),
    width: numberInput({
      label: 'Width',
    }),
    height: numberInput({
      label: 'Height',
    }),
  },
})

// Card component
const cardInput = objectInput({
  fields: {
    title: textInput({
      label: 'Title',
    }),
    description: textInput({
      label: 'Description',
    }),
    image: inputRef(imageInput),
    button: inputRef(buttonInput),
  },
})

// Alignment options
const alignLeftInput = primitiveInput({ value: 'left' })
const alignCenterInput = primitiveInput({ value: 'center' })
const alignRightInput = primitiveInput({ value: 'right' })

const alignInput = oneOfInput({
  label: 'Alignment',
  options: [
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(alignLeftInput),
      value: 'left',
    },
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(alignCenterInput),
      value: 'center',
    },
    {
      tag: 'primitive',
      uuid: randomUuid(),
      input: inputRef(alignRightInput),
      value: 'right',
    },
  ].map(toFlat),
})

// Hero section component
const heroSectionInput = objectInput({
  label: 'Hero',
  fields: {
    headline: textInput({
      label: 'Headline',
    }),
    subheadline: textInput({
      label: 'Subheadline',
    }),
    backgroundImage: inputRef(imageInput),
    primaryButton: inputRef(buttonInput),
    secondaryButton: inputRef(buttonInput),
    textAlign: alignInput,
  },
})

// Feature component
const featureInput = objectInput({
  label: 'Feature',
  fields: {
    icon: textInput({
      label: 'Icon',
    }),
    title: textInput({
      label: 'Title',
    }),
    description: textInput({
      label: 'Description',
    }),
  },
})

// Card grid section
const cardGridSectionInput = objectInput({
  label: 'Card Grid',
  fields: {
    title: textInput({
      label: 'Section Title',
    }),
    description: textInput({
      label: 'Section Description',
    }),
    cards: arrayInput({
      items: [],
    }),
  },
})

// Features section
const featuresSectionInput = objectInput({
  label: 'Features',
  fields: {
    title: textInput({
      label: 'Section Title',
    }),
    description: textInput({
      label: 'Section Description',
    }),
    features: arrayInput({
      items: [],
    }),
  },
})

// Website page input
const websitePageInput = objectInput({
  label: 'Page',
  fields: {
    type: primitiveInput({
      label: 'Type',
      value: 'website-page',
    }),
    title: textInput({
      label: 'Page Title',
    }),
    sections: arrayInput({
      label: 'Sections',
      items: [
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(heroSectionInput),
          value: {
            headline: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'New Hero Section',
            },
            subheadline: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Add your subheadline here',
            },
            backgroundImage: {
              tag: 'object',
              uuid: randomUuid(),
              input: inputRef(imageInput),
              value: {
                src: { tag: 'text', uuid: randomUuid(), value: '' },
                alt: { tag: 'text', uuid: randomUuid(), value: '' },
                width: { tag: 'number', uuid: randomUuid(), value: 1920 },
                height: { tag: 'number', uuid: randomUuid(), value: 1080 },
              },
            },
            primaryButton: {
              tag: 'object',
              uuid: randomUuid(),
              input: inputRef(buttonInput),
              value: {
                text: { tag: 'text', uuid: randomUuid(), value: 'Click Here' },
                url: { tag: 'text', uuid: randomUuid(), value: '#' },
                variant: {
                  tag: 'one-of',
                  uuid: randomUuid(),
                  input: inputRef(buttonVariantInput),
                  value: {
                    tag: 'primitive',
                    uuid: randomUuid(),
                    input: inputRef(buttonPrimaryVariant),
                    value: 'primary',
                  },
                },
              },
            },
            secondaryButton: {
              tag: 'object',
              uuid: randomUuid(),
              input: inputRef(buttonInput),
              value: {
                text: { tag: 'text', uuid: randomUuid(), value: 'Learn More' },
                url: { tag: 'text', uuid: randomUuid(), value: '#' },
                variant: {
                  tag: 'one-of',
                  uuid: randomUuid(),
                  input: inputRef(buttonVariantInput),
                  value: {
                    tag: 'primitive',
                    uuid: randomUuid(),
                    input: inputRef(buttonSecondaryVariant),
                    value: 'secondary',
                  },
                },
              },
            },
            textAlign: {
              tag: 'one-of',
              uuid: randomUuid(),
              input: inputRef(alignInput),
              value: {
                tag: 'primitive',
                uuid: randomUuid(),
                input: inputRef(alignCenterInput),
                value: 'center',
              },
            },
          },
        },
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(featuresSectionInput),
          value: {
            title: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'New Features Section',
            },
            description: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Add your description here',
            },
            features: {
              tag: 'array',
              uuid: randomUuid(),
              value: [],
            },
          },
        },
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(cardGridSectionInput),
          value: {
            title: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'New Card Grid Section',
            },
            description: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Add your description here',
            },
            cards: {
              tag: 'array',
              uuid: randomUuid(),
              value: [],
            },
          },
        },
      ].map(toFlat),
    }),
  },
})

const inputLibrary = {
  websitePageInput,
  heroSectionInput,
  featuresSectionInput,
  cardGridSectionInput,
  cardInput,
  featureInput,
  buttonInput,
  imageInput,
  basicTextInput,
  basicNumberInput,
  buttonVariantInput,
  buttonPrimaryVariant,
  buttonSecondaryVariant,
  buttonOutlineVariant,
  alignInput,
  alignLeftInput,
  alignCenterInput,
  alignRightInput,
}

// TODO algorithm that adds uuids
const contentTree = {
  tag: 'object',
  uuid: randomUuid(),
  input: inputRef(inputLibrary.websitePageInput),
  value: {
    type: {
      tag: 'primitive',
      uuid: randomUuid(),
      value: 'website-page',
    },
    title: {
      tag: 'text',
      uuid: randomUuid(),
      value: 'Welcome to Our Website',
    },
    sections: {
      tag: 'array',
      uuid: randomUuid(),
      value: [
        // Hero Section
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(inputLibrary.heroSectionInput),
          value: {
            headline: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Build Amazing Products',
            },
            subheadline: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Create stunning websites with our easy-to-use platform',
            },
            backgroundImage: {
              tag: 'object',
              uuid: randomUuid(),
              input: inputRef(inputLibrary.imageInput),
              value: {
                src: {
                  tag: 'text',
                  uuid: randomUuid(),
                  value: 'https://via.placeholder.com/1920x1080',
                },
                alt: {
                  tag: 'text',
                  uuid: randomUuid(),
                  value: 'Hero background',
                },
                width: {
                  tag: 'number',
                  uuid: randomUuid(),
                  value: 1920,
                },
                height: {
                  tag: 'number',
                  uuid: randomUuid(),
                  value: 1080,
                },
              },
            },
            primaryButton: {
              tag: 'object',
              uuid: randomUuid(),
              input: inputRef(inputLibrary.buttonInput),
              value: {
                text: {
                  tag: 'text',
                  uuid: randomUuid(),
                  value: 'Get Started',
                },
                url: {
                  tag: 'text',
                  uuid: randomUuid(),
                  value: '/signup',
                },
                variant: {
                  tag: 'one-of',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.buttonVariantInput),
                  value: {
                    tag: 'primitive',
                    uuid: randomUuid(),
                    input: inputRef(inputLibrary.buttonPrimaryVariant),
                    value: 'primary',
                  },
                },
              },
            },
            secondaryButton: {
              tag: 'object',
              uuid: randomUuid(),
              input: inputRef(inputLibrary.buttonInput),
              value: {
                text: {
                  tag: 'text',
                  uuid: randomUuid(),
                  value: 'Learn More',
                },
                url: {
                  tag: 'text',
                  uuid: randomUuid(),
                  value: '/about',
                },
                variant: {
                  tag: 'one-of',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.buttonVariantInput),
                  value: {
                    tag: 'primitive',
                    uuid: randomUuid(),
                    input: inputRef(inputLibrary.buttonSecondaryVariant),
                    value: 'secondary',
                  },
                },
              },
            },
            textAlign: {
              tag: 'one-of',
              uuid: randomUuid(),
              input: inputRef(inputLibrary.alignInput),
              value: {
                tag: 'primitive',
                uuid: randomUuid(),
                input: inputRef(inputLibrary.alignCenterInput),
                value: 'center',
              },
            },
          },
        },
        // Features Section
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(inputLibrary.featuresSectionInput),
          value: {
            title: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Our Features',
            },
            description: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Everything you need to build your website',
            },
            features: {
              tag: 'array',
              uuid: randomUuid(),
              value: [
                {
                  tag: 'object',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.featureInput),
                  value: {
                    icon: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: '🚀',
                    },
                    title: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'Fast Performance',
                    },
                    description: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value:
                        'Lightning-fast load times for better user experience',
                    },
                  },
                },
                {
                  tag: 'object',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.featureInput),
                  value: {
                    icon: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: '🎨',
                    },
                    title: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'Beautiful Design',
                    },
                    description: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value:
                        'Stunning designs that convert visitors to customers',
                    },
                  },
                },
                {
                  tag: 'object',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.featureInput),
                  value: {
                    icon: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: '🔒',
                    },
                    title: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'Secure & Reliable',
                    },
                    description: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value:
                        'Enterprise-grade security and 99.9% uptime guarantee',
                    },
                  },
                },
              ],
            },
          },
        },
        // Card Grid Section
        {
          tag: 'object',
          uuid: randomUuid(),
          input: inputRef(inputLibrary.cardGridSectionInput),
          value: {
            title: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Our Services',
            },
            description: {
              tag: 'text',
              uuid: randomUuid(),
              value: 'Explore what we have to offer',
            },
            cards: {
              tag: 'array',
              uuid: randomUuid(),
              value: [
                {
                  tag: 'object',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.cardInput),
                  value: {
                    title: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'Web Development',
                    },
                    description: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'Custom websites tailored to your business needs',
                    },
                    image: {
                      tag: 'object',
                      uuid: randomUuid(),
                      input: inputRef(inputLibrary.imageInput),
                      value: {
                        src: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: 'https://via.placeholder.com/400x300',
                        },
                        alt: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: 'Web Development',
                        },
                        width: {
                          tag: 'number',
                          uuid: randomUuid(),
                          value: 400,
                        },
                        height: {
                          tag: 'number',
                          uuid: randomUuid(),
                          value: 300,
                        },
                      },
                    },
                    button: {
                      tag: 'object',
                      uuid: randomUuid(),
                      input: inputRef(inputLibrary.buttonInput),
                      value: {
                        text: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: 'Learn More',
                        },
                        url: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: '/services/web-dev',
                        },
                        variant: {
                          tag: 'one-of',
                          uuid: randomUuid(),
                          input: inputRef(inputLibrary.buttonVariantInput),
                          value: {
                            tag: 'primitive',
                            uuid: randomUuid(),
                            input: inputRef(inputLibrary.buttonPrimaryVariant),
                            value: 'primary',
                          },
                        },
                      },
                    },
                  },
                },
                {
                  tag: 'object',
                  uuid: randomUuid(),
                  input: inputRef(inputLibrary.cardInput),
                  value: {
                    title: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'Mobile Apps',
                    },
                    description: {
                      tag: 'text',
                      uuid: randomUuid(),
                      value: 'iOS and Android apps that users love',
                    },
                    image: {
                      tag: 'object',
                      uuid: randomUuid(),
                      input: inputRef(inputLibrary.imageInput),
                      value: {
                        src: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: 'https://via.placeholder.com/400x300',
                        },
                        alt: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: 'Mobile Apps',
                        },
                        width: {
                          tag: 'number',
                          uuid: randomUuid(),
                          value: 400,
                        },
                        height: {
                          tag: 'number',
                          uuid: randomUuid(),
                          value: 300,
                        },
                      },
                    },
                    button: {
                      tag: 'object',
                      uuid: randomUuid(),
                      input: inputRef(inputLibrary.buttonInput),
                      value: {
                        text: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: 'View Portfolio',
                        },
                        url: {
                          tag: 'text',
                          uuid: randomUuid(),
                          value: '/services/mobile',
                        },
                        variant: {
                          tag: 'one-of',
                          uuid: randomUuid(),
                          input: inputRef(inputLibrary.buttonVariantInput),
                          value: {
                            tag: 'primitive',
                            uuid: randomUuid(),
                            input: inputRef(inputLibrary.buttonOutlineVariant),
                            value: 'outline',
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
}

const toInputMap = (library: Record<string, ContentInput>): InputMap => ({
  tag: 'content-input-store',
  data: Object.fromEntries(
    Object.entries(library).map(([_key, value]) => [value.uuid, value]),
  ),
})

const rootUuid = contentTree.uuid
const defaultContent: FlatContent = toFlat(contentTree)
const defaultInput: InputMap = toInputMap(inputLibrary)

const contentStore: ContentStore = createBinder(
  new Y.Doc().getMap('content'),
  defaultContent,
)

const contentInputStore: InputStore = createBinder(
  new Y.Doc().getMap('contentInput'),
  defaultInput,
)

export const YjsEditor = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Editor
          </Typography>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="end"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
          pt: 10,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 960,
          }}
        >
          <ContentJsonView
            store={contentStore}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <Paper
            sx={{
              borderRadius: 2,
              p: 2,
            }}
          >
            <Editor
              store={contentStore}
              inputStore={contentInputStore}
              schema={inputLibrary.websitePageInput}
              rootUuid={rootUuid}
            />
          </Paper>
        </Box>
      </Box>
    </>
  )
}

const ContentJsonView: FunctionComponent<{
  store: ContentStore
  open: boolean
  onClose: () => void
}> = (props) => {
  const { store, open, onClose } = props
  return (
    <ContentYjsStoreContextProvider store={store}>
      <ContentJsonViewWithContext
        open={open}
        onClose={onClose}
      />
    </ContentYjsStoreContextProvider>
  )
}

const selectAll = (state: FlatContent) => state

const ContentJsonViewWithContext: FunctionComponent<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const state = useSelector(selectAll)
  const [tabValue, setTabValue] = useState(0)

  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 360,
        maxWidth: '90vw',
        bgcolor: 'background.paper',
        boxShadow: 4,
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">Data Inspector</Typography>
        <IconButton
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tab label="Source" />
        <Tab label="Tree" />
        <Tab label="Value-only" />
      </Tabs>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        {tabValue === 0 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                color: 'text.secondary',
              }}
            >
              The data is stored in a key-value database that maps content UUID
              to: content
            </Typography>
            <JsonView data={state} />
          </Stack>
        )}
        {tabValue === 1 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                color: 'text.secondary',
              }}
            >
              The data can be transformed into a tree structure, which can be
              easier to work with:
            </Typography>
            <JsonView data={toTree(state)} />
          </Stack>
        )}
        {tabValue === 2 && (
          <Stack spacing={2}>
            <Typography
              sx={{
                color: 'text.secondary',
              }}
            >
              The tree-representation can be further simplified by recursively
              extracting the value:
            </Typography>
            <JsonView data={toValueOnlyTree(toTree(state))} />
          </Stack>
        )}
      </Box>
    </Box>
  )
}
