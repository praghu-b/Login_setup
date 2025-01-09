import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminSignup from './components/AdminSignup';
import AdminHome from './components/AdminHome';
import UserHome from './components/UserHome';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import { AppBar, Toolbar, Button, Container, Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Get current path
  const path = window.location.pathname;
  const showNavBar = !['/user-home', '/admin-home', '/profile'].includes(path);

  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          {showNavBar && (
            <AppBar position="static">
              <Toolbar>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/signup">
                  Sign Up
                </Button>
              </Toolbar>
            </AppBar>
          )}
          
          <Container>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin-home" element={<AdminHome />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/user-home" element={<UserHome />} />
              <Route path="/" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;