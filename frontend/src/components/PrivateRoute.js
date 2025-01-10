import { Navigate } from 'react-router-dom';
import React from 'react';

const PrivateRoute = ({ element, ...rest }) => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo || JSON.parse(userInfo).user_type !== 'admin') {
    return <Navigate to="/login" />;
  }
  return element;
};

export default PrivateRoute;
