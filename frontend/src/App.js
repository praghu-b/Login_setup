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
import { Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import CourseDetails from './components/CourseDetails';
import SyllabusDisplay from './components/SyllabusDisplay';
import ContentDisplay from './components/ContentDisplay';
import PrivateRoute from './components/PrivateRoute';
import UserProvider from './context/UserProvider';
import CourseContent from './components/home/CourseContent';

function App() {
  const path = window.location.pathname;
  // const showNavBar = !['/user-home', '/admin-home', '/profile'].includes(path);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const checkUser = () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <UserProvider>
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
              <Route path="/admin-home" element={<PrivateRoute element={<AdminHome />} />} />
              <Route path="/user-home" element={<PrivateRoute element={<UserHome />} />} />
              <Route path="/course-content" element={<PrivateRoute element={<CourseContent />}/>}/>
              <Route path="/" element={<PrivateRoute element={user && user.user_type == 'admin' ? <AdminHome /> : <UserHome />} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </UserProvider>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;