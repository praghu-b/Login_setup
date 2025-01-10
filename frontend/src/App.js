  import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import Dashboard from './components/Dashboard';
import CourseDetails from './components/CourseDetails';
import SyllabusDisplay from './components/SyllabusDisplay';
import ContentDisplay from './components/ContentDisplay';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

function App() {
  // Get current path
  const path = window.location.pathname;
  const showNavBar = !['/user-home', '/admin-home', '/profile'].includes(path);

  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const checkUser = () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        console.log('User Type: ', JSON.parse(userInfo).user_type); 
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for changes in localStorage
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          {/* {showNavBar && (
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
          )} */}
          
          <Container>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin-login" element={<Login />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
              <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/create-course" element={<PrivateRoute element={<CourseDetails />} />} />
              <Route path="/syllabus" element={<PrivateRoute element={<SyllabusDisplay />} />} />
              <Route path="/edit-syllabus" element={<PrivateRoute element={<SyllabusDisplay />} />} />
              <Route path="/content" element={<PrivateRoute element={<ContentDisplay />} />} />
              <Route path="/admin-home" element={user && user.user_type == 'admin' ? <AdminHome /> : <Navigate to="/login" />} />
              <Route path="/user-home" element={user && user.user_type == 'user' ? <UserHome /> : <Navigate to="/login" />} />
              <Route path="/" element={user && user.user_type == 'admin' ? <AdminHome /> : <UserHome />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;