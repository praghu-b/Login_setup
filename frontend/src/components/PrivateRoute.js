import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

const PrivateRoute = ({ element }) => {
  const location = useLocation();
  const userInfo = localStorage.getItem('userInfo');
  const userType = userInfo ? JSON.parse(userInfo).user_type : null;

  // Define accessible routes for user and admin
  const userRoutes = ['/user-home', '/profile', '/course-content'];
  const adminRoutes = ['/syllabus', '/content', '/admin-home', '/create-course', '/dashboard', '/profile'];

  if (!userInfo) {
    return <Navigate to="/login" />;
  } else if (userType === 'admin' && adminRoutes.includes(location.pathname)) {
    return element; // Allow admin to access admin routes
  } else if (userType === 'user' && userRoutes.includes(location.pathname)) {
    return element; // Allow user to access user routes
  } else {
    return <Navigate to="/login" />; // Redirect if access is denied
  }
};

export default PrivateRoute;
