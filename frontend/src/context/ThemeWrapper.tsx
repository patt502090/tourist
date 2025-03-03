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

  const darkTheme = createTheme({
    palette: {
      mode, // light หรือ dark
      primary: {
        light: '#FF69B4', // Hot Pink สดใสสำหรับโหมด light
        dark: '#00FFFF',  // Cyan Neon สว่างสำหรับโหมด dark
        main: mode === 'light' ? '#FF1493' : '#00CED1', // Deep Pink หรือ Dark Cyan
      },
      secondary: {
        light: '#FFFF00', // Yellow สะดุดตา
        dark: '#FF00FF',  // Magenta Neon
        main: mode === 'light' ? '#FFD700' : '#FF00FF', // Gold หรือ Magenta
      },
      background: {
        default: mode === 'light' ? '#F0F8FF' : '#1A1A2E', // Alice Blue หรือ Dark Navy
        paper: mode === 'light' ? '#FFFFFF' : '#16213E',   // ขาวสะอาด หรือน้ำเงินเข้ม
      },
      common: {
        white: '#FFFFFF',
        black: '#000000',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#E0E0E0', // เทาเข้ม หรือ เทาอ่อน
        secondary: mode === 'light' ? '#FF4500' : '#39FF14', // Orange หรือ Neon Green
      },
    },
    typography: {
      fontFamily: "'Orbitron', 'Roboto', sans-serif", // ฟอนต์แนว futuristic
      button: {
        textTransform: 'uppercase', // ปุ่มตัวพิมพ์ใหญ่ให้ดูเด่น
        fontWeight: 700, // หนาๆ
      },
      h1: {
        fontSize: '2.5rem',
        fontWeight: 900,
        letterSpacing: '2px', // ห่างๆ ให้ดูเฟี้ยว
      },
    },
    components: {
      // ปรับแต่งปุ่มให้มี Neon Glow
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow:
              mode === 'light'
                ? '0 0 10px rgba(255, 105, 180, 0.5)' // Pink glow
                : '0 0 10px rgba(0, 255, 255, 0.7)', // Cyan glow
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0 0 15px rgba(255, 20, 147, 0.8)'
                  : '0 0 15px rgba(0, 206, 209, 0.9)',
            },
          },
        },
      },
      // ปรับพื้นหลัง Paper ให้มีลูกเล่น
      MuiPaper: {
        styleOverrides: {
          root: {
            background:
              mode === 'dark'
                ? 'linear-gradient(45deg, #1A1A2E, #16213E)' // Gradient มืด
                : 'linear-gradient(45deg, #F0F8FF, #FFFFFF)', // Gradient สว่าง
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
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeWrapperContext.Provider>
  );
};

export default ThemeWrapper;