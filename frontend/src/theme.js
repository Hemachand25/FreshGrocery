import { createTheme } from '@mui/material/styles'


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FC8019', // Swiggy orange
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#FF8A00', // complementary orange tone for accents
      contrastText: '#ffffff'
    },
    info: {
      main: '#5A3E85' // Zepto purple for accents
    },
    background: {
      default: '#FAFAFA',
      paper: '#ffffff'
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5F6C7B'
    }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 8px 24px rgba(252,128,25,0.15)' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 }
      }
    }
  }
})

export default theme


