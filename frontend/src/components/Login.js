import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import AuthBackground from './AuthBackground';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Set user type based on URL path
    setUserType(location.pathname === '/admin-login' ? 'admin' : 'user');
  }, [location.pathname]);

  return (
    <AuthBackground>
      <h1 className="text-4xl font-bold text-amber-400 mb-2">
        {userType === 'admin' ? 'Admin Sign In' : 'Sign In'}
      </h1>
      <p className="text-3xl font-bold text-black mb-5">to get back in track</p>

      {error && (
        <div className="mb-4">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setError('');
            const response = await axios.post('/api/login/', {
              ...values,
              user_type: userType
            });

            localStorage.setItem('userInfo', JSON.stringify(response.data));
            // Redirect based on user type
            navigate(userType === 'admin' ? '/dashboard' : '/user-home');
          } catch (error) {
            setError(error.response?.data?.error || 'Login failed');
          }
          setSubmitting(false);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <Field
                className="w-full p-4 placeholder-black rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-600"
                name="email"
                placeholder="Email"
              />
              {touched.email && errors.email && (
                <p className="text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className='relative'>
              <Field
                className="w-full p-4 placeholder-black rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-600"
                name="password"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
              />
              {showPassword ? (
                <VisibilityOffIcon
                  onClick={() => setShowPassword(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                />
              ) : (
                <VisibilityIcon
                  onClick={() => setShowPassword(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                />
              )}
              {touched.password && errors.password && (
                <p className="text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="text-right">
              <RouterLink to="/forgot-password" className="text-amber-400 hover:text-amber-500">
                Forgot Password?
              </RouterLink>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-900 text-white py-4 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
              disabled={isSubmitting}
            >
              Sign In
            </button>

            <div className="text-center mt-6">
              <span className="text-gray-600">Don't have an account? </span>
              <RouterLink 
                to={userType === 'admin' ? '/admin-signup' : '/signup'} 
                className="text-amber-400 hover:text-amber-500 font-semibold"
              >
                Sign Up
              </RouterLink>
            </div>
          </Form>
        )}
      </Formik>
    </AuthBackground>
  );
};

export default Login; 