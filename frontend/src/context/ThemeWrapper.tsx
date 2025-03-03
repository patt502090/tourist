import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { createContext, FC, useContext, useMemo, useState } from 'react';
import { contextWrapperProps, themeContext } from '../utils/types';

export const ThemeWrapperContext = createContext<themeContext>({
  toggleColorMode: () => {},
  colorMode: 'light',
});

export const usethemeUtils = () => {
  const themeutils = useContext(ThemeWrapperContext);
  return themeutils;
};

const ThemeWrapper: FC<contextWrapperProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const cuteTheme = createTheme({
    palette: {
      mode,
      primary: {
        light: '#FFD1DC', // Soft Pastel Pink
        dark: '#B0BEC5',  // Gentle Slate Gray
        main: mode === 'light' ? '#FF9999' : '#90A4AE', // Light Coral หรือ Cool Blue-Gray
        contrastText: '#FFFFFF',
      },
      secondary: {
        light: '#CCFFCC', // Minty Green
        dark: '#D7CCC8',  // Warm Beige
        main: mode === 'light' ? '#99CC99' : '#BCAAA4', // Pale Green หรือ Soft Taupe
        contrastText: '#333333',
      },
      background: {
        default: mode === 'light' ? '#F9FAFB' : '#263238', // Light Gray หรือ Deep Blue-Gray
        paper: mode === 'light' ? '#FFFFFF' : '#37474F',   // Pure White หรือ Dark Slate
      },
      common: {
        white: '#FFFFFF',
        black: '#000000',
      },
      text: {
        primary: mode === 'light' ? '#4A4A4A' : '#ECEFF1', // Soft Charcoal หรือ Off-White
        secondary: mode === 'light' ? '#FF6699' : '#80DEEA', // Bubblegum Pink หรือ Sky Cyan
      },
      error: { main: '#EF5350' },    // Gentle Red
      warning: { main: '#FFA726' },  // Warm Orange
      info: { main: '#42A5F5' },     // Calm Blue
      success: { main: '#66BB6A' },  // Friendly Green
    },
    typography: {
      fontFamily: "'Poppins', 'Roboto', sans-serif", // Clean and friendly font
      fontWeightRegular: 400,
      fontWeightBold: 600,
      h1: {
        fontSize: '2.25rem',
        fontWeight: 600,
        letterSpacing: '0.5px',
        color: mode === 'light' ? '#4A4A4A' : '#ECEFF1',
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 500,
        letterSpacing: '0.3px',
      },
      button: {
        textTransform: 'capitalize', // Soft lowercase vibe
        fontWeight: 500,
        fontSize: '0.95rem',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
      },
    },
    components: {
      // ปุ่มเรียบง่ายน่ารัก
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '6px 20px',
            background: mode === 'light'
              ? 'linear-gradient(45deg, #FF9999, #FFD1DC)' // Soft Pink Gradient
              : 'linear-gradient(45deg, #90A4AE, #B0BEC5)', // Cool Gray Gradient
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            color: mode === 'light' ? '#FFFFFF' : '#ECEFF1',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-2px)', // Gentle lift
              background: mode === 'light'
                ? 'linear-gradient(45deg, #FF6699, #FFB3CC)'
                : 'linear-gradient(45deg, #78909C, #90A4AE)',
            },
          },
          outlined: {
            border: `1px solid ${mode === 'light' ? '#FF9999' : '#90A4AE'}`,
            background: 'transparent',
            color: mode === 'light' ? '#FF9999' : '#90A4AE',
            '&:hover': {
              background: mode === 'light' ? 'rgba(255, 153, 153, 0.1)' : 'rgba(144, 164, 174, 0.1)',
            },
          },
        },
      },
      // Paper เรียบๆ สบายตา
      MuiPaper: {
        styleOverrides: {
          root: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #FFFFFF, #F9FAFB)'
              : 'linear-gradient(135deg, #37474F, #263238)',
            borderRadius: '16px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            border: mode === 'light' ? '1px solid #EEEEEE' : '1px solid #455A64',
          },
        },
      },
      // Card สไตล์น่ารัก
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            background: mode === 'light' ? '#FFFFFF' : '#37474F',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
            padding: '16px',
          },
        },
      },
      // Table เรียบง่ายแต่ดูดี
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: mode === 'light'
              ? '1px solid #EEEEEE'
              : '1px solid #455A64',
            padding: '10px',
          },
          head: {
            fontWeight: 600,
            color: mode === 'light' ? '#4A4A4A' : '#ECEFF1',
            background: mode === 'light'
              ? 'rgba(255, 153, 153, 0.05)'
              : 'rgba(144, 164, 174, 0.05)',
          },
          body: {
            color: mode === 'light' ? '#4A4A4A' : '#ECEFF1',
          },
        },
      },
    },
  });

  const themeWrapperUtils = useMemo(
    () => ({
      colorMode: mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  return (
    <ThemeWrapperContext.Provider value={themeWrapperUtils}>
      <ThemeProvider theme={cuteTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeWrapperContext.Provider>
  );
};

export default ThemeWrapper;