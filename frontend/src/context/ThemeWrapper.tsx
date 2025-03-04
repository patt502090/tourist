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

  const exquisiteTheme = createTheme({
    palette: {
      mode, // 'light' or 'dark'
      primary: {
        light: '#E2C2FF', // Lilac Mist for light mode
        dark: '#81C1FF',  // Celestial Blue for dark mode
        main: mode === 'light' ? '#8B5CF6' : '#3B82F6', // Vibrant Violet or Electric Blue
        contrastText: '#FFFFFF',
      },
      secondary: {
        light: '#FFD7B5', // Champagne Gold
        dark: '#FCA5A5',  // Coral Blush
        main: mode === 'light' ? '#F97316' : '#EF4444', // Fiery Orange or Crimson Red
        contrastText: mode === 'light' ? '#1E293B' : '#FFFFFF', // Slate or White
      },
      background: {
        default: mode === 'light' ? '#F8F9FE' : '#0F172A', // Pearl White or Cosmic Black
        paper: mode === 'light' ? '#FFFFFF' : '#1E293B',   // Crisp White or Obsidian Slate
      },
      common: {
        white: '#FFFFFF',
        black: '#000000',
      },
      text: {
        primary: mode === 'light' ? '#1E293B' : '#D1D5DB', // Deep Slate or Soft Gray
        secondary: mode === 'light' ? '#7C3AED' : '#60A5FA', // Royal Purple or Sky Blue
      },
    },
    typography: {
      fontFamily: "'Cinzel', 'Montserrat', serif", // Luxurious and modern combo
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 800,
      button: {
        textTransform: 'none', // Minimalist elegance
        fontWeight: 600,
        letterSpacing: '1.2px',
        fontSize: '1rem',
      },
      h1: {
        fontFamily: "'Cinzel', serif",
        fontSize: '3rem',
        fontWeight: 800,
        letterSpacing: '2px',
        lineHeight: 1.1,
        textShadow:
          mode === 'light'
            ? '0 2px 4px rgba(139, 92, 246, 0.2)'
            : '0 2px 4px rgba(59, 130, 246, 0.3)', // Subtle regal shadow
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            padding: '12px 24px',
            background:
              mode === 'light'
                ? 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)' // Violet to Magenta
                : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', // Blue gradient
            boxShadow:
              mode === 'light'
                ? '0 4px 20px rgba(139, 92, 246, 0.5)'
                : '0 4px 20px rgba(59, 130, 246, 0.6)',
            transition: 'all 0.4s ease',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0 6px 30px rgba(139, 92, 246, 0.8)'
                  : '0 6px 30px rgba(59, 130, 246, 0.9)',
              transform: 'scale(1.05)', // Slight scale for a premium feel
              background:
                mode === 'light'
                  ? 'linear-gradient(135deg, #D946EF 0%, #8B5CF6 100%)'
                  : 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', // Reverse gradient
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background:
              mode === 'dark'
                ? 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)' // Cosmic radial effect
                : 'radial-gradient(circle at center, #FFFFFF 0%, #F8F9FE 100%)', // Soft pearl glow
            borderRadius: '20px',
            border: mode === 'dark' ? '1px solid rgba(59, 130, 246, 0.2)' : 'none', // Subtle border in dark mode
            boxShadow:
              mode === 'light'
                ? '0 4px 25px rgba(139, 92, 246, 0.1)'
                : '0 4px 25px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0 6px 35px rgba(139, 92, 246, 0.2)'
                  : '0 6px 35px rgba(59, 130, 246, 0.3)',
            },
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
      <ThemeProvider theme={exquisiteTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeWrapperContext.Provider>
  );
};

export default ThemeWrapper;