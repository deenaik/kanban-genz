import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import './index.css';
import App from './App';

// Define a base theme for styled-components
const baseTheme = {
  colors: {
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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <StyledThemeProvider theme={baseTheme}>
      <App />
    </StyledThemeProvider>
  </React.StrictMode>
); 