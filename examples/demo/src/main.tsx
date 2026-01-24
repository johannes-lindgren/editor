import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066ff', // Vibrant blue
      light: '#4d94ff',
      dark: '#0052cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed', // Modern purple
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc', // Soft light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    body1: {
      letterSpacing: '0.01em',
    },
    body2: {
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 2px 4px rgba(0, 0, 0, 0.08)',
    '0px 2px 6px rgba(0, 0, 0, 0.1)',
    '0px 3px 8px rgba(0, 0, 0, 0.1)',
    '0px 4px 10px rgba(0, 0, 0, 0.1)',
    '0px 5px 12px rgba(0, 0, 0, 0.12)',
    '0px 6px 14px rgba(0, 0, 0, 0.12)',
    '0px 7px 16px rgba(0, 0, 0, 0.12)',
    '0px 8px 18px rgba(0, 0, 0, 0.14)',
    '0px 9px 20px rgba(0, 0, 0, 0.14)',
    '0px 10px 22px rgba(0, 0, 0, 0.14)',
    '0px 11px 24px rgba(0, 0, 0, 0.16)',
    '0px 12px 26px rgba(0, 0, 0, 0.16)',
    '0px 13px 28px rgba(0, 0, 0, 0.16)',
    '0px 14px 30px rgba(0, 0, 0, 0.18)',
    '0px 15px 32px rgba(0, 0, 0, 0.18)',
    '0px 16px 34px rgba(0, 0, 0, 0.18)',
    '0px 17px 36px rgba(0, 0, 0, 0.2)',
    '0px 18px 38px rgba(0, 0, 0, 0.2)',
    '0px 19px 40px rgba(0, 0, 0, 0.2)',
    '0px 20px 42px rgba(0, 0, 0, 0.22)',
    '0px 21px 44px rgba(0, 0, 0, 0.22)',
    '0px 22px 46px rgba(0, 0, 0, 0.22)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 102, 255, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 102, 255, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        },
        elevation4: {
          boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0066ff',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0066ff',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 48,
          color: '#64748b',
          '&.Mui-selected': {
            color: '#0066ff',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: '#0066ff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 102, 255, 0.04)',
          },
        },
      },
    },
  },
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Could not find root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
