import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import GraduateImg from '../images/login.png'

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  return (
    <div className="flex justify-center min-h-screen">
      <div className='container my-5 flex bg-pink-100 rounded-2xl'>
        {/* Left side with illustration */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <div className="w-96 h-96 rounded-full flex items-center justify-center">
            <img
              src={GraduateImg} // Make sure to add this image to your public folder
              alt="Graduate Avatar"
              className="w-full"
            />
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="card shadow rounded-2xl bg-white w-full max-w-md p-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-amber-400 mb-2">Sign In</h1>
              <p className="text-3xl font-bold text-black">to get back in track</p>
            </div>

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
                    user_type: 'user' // Fixed to only user login
                  });

                  localStorage.setItem('userInfo', JSON.stringify(response.data));
                  navigate('/user-home'); // Redirect to user home
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
                      className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-600"
                      name="email"
                      placeholder="Email"
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Field
                      className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-600"
                      name="password"
                      placeholder="Password"
                      type="password"
                    />
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
                    className="w-full bg-rose-600 text-white py-4 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Sign In
                  </button>

                  <div className="text-center mt-6">
                    <span className="text-gray-600">Don't have an account? </span>
                    <RouterLink to="/signup" className="text-amber-400 hover:text-amber-500 font-semibold">
                      Sign UP
                    </RouterLink>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 