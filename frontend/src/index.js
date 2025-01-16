import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import UserProvider from './context/UserProvider';
import App from './App';
import './index.css';
import { LoadingProvider } from './context/LoadingContext';
import LoadingComponent from './components/common/LoadingComponent';

const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', scrollbarWidth: 'none' }}>
        <UserProvider>
          <LoadingProvider>
            <LoadingComponent/>
            <App />
          </LoadingProvider>
        </UserProvider>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
