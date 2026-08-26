import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1a1a2e', contrastText: '#fff' },
    secondary: { main: '#c8a97e', contrastText: '#1a1a2e' },
    background: { default: '#f5f0e8', paper: '#fff' },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: '#1a1a2e' } }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: { backgroundColor: '#1a1a2e', '&:hover': { backgroundColor: '#2a2a4e' } },
        containedSecondary: { backgroundColor: '#c8a97e', color: '#1a1a2e', '&:hover': { backgroundColor: '#b8996e' } },
      }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } }
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12 } }
    }
  }
});

export default theme;
