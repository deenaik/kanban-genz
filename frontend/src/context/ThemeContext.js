import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? {
      background: '#1a1b1e',
      surface: '#2d2e32',
      surfaceHover: '#34353a',
      text: '#ffffff',
      textSecondary: '#a0aec0',
      primary: '#6c5ce7',
      primaryHover: '#5f3dc4',
      border: '#404040',
      danger: '#ff4444',
      dangerHover: '#cc0000',
      cancel: '#4a4b4f',
      cancelHover: '#3a3b3f',
      scrollbar: '#4a4b4f',
      scrollbarHover: '#606060'
    } : {
      background: '#f5f6f8',
      surface: '#ffffff',
      surfaceHover: '#f8f9fa',
      text: '#2d3436',
      textSecondary: '#636e72',
      primary: '#6c5ce7',
      primaryHover: '#5f3dc4',
      border: '#e0e0e0',
      danger: '#ff7675',
      dangerHover: '#d63031',
      cancel: '#b2bec3',
      cancelHover: '#636e72',
      scrollbar: '#cbd5e0',
      scrollbarHover: '#a0aec0'
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 