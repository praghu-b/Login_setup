import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import OTPVerification from './OTPVerification';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import GraduateImg from '../images/login.png';
import AuthBackground from './AuthBackground';

const SignupSchema = Yup.object().shape({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  mobile_number: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('user');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  return (
    <AuthBackground>
      <h1 className="text-3xl font-bold mb-2 text-amber-400">Sign Up</h1>
      <h2 className="text-xl font-bold mb-4">to enlighten your skills!</h2>

      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          mobile_number: '',
          password: '',
          confirm_password: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (!isEmailVerified) {
              setSnackbar({
                open: true,
                message: 'Please verify your email first',
                severity: 'error'
              });
              return;
            }
            if (!isMobileVerified) {
              setSnackbar({
                open: true,
                message: 'Please verify your mobile number first',
                severity: 'error'
              });
              return;
            }
            setError('');
            await axios.post('/api/register/', {
              ...values,
              name: `${values.first_name} ${values.last_name}`,
              user_type: userType
            });
            setSnackbar({
              open: true,
              message: `${userType === 'admin' ? 'Admin' : 'User'} registered successfully!`,
              severity: 'success'
            });
            navigate('/login');
          } catch (error) {
            setError(error.response?.data?.error || 'Registration failed');
          }
          setSubmitting(false);
        }}
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Field
                  className={`w-full p-2 border placeholder-black rounded-lg ${touched.first_name && errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                  name="first_name"
                  placeholder="First Name"
                />
                <Field
                  className="w-full p-2 border placeholder-black rounded-lg border-gray-300"
                  name="last_name"
                  placeholder="Middle Name (optional)"
                />
              </div>  
              
              <Field
                className={`w-full p-2 border placeholder-black rounded-lg ${touched.last_name && errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                name="last_name"
                placeholder="Last Name"
              />

              <div className="relative">
                <Field
                  className={`w-full p-2 border placeholder-black rounded-lg ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  name="email"
                  placeholder="Email Address"
                  disabled={isEmailVerified}
                />
                {!isEmailVerified && values.email && !errors.email && (
                  <OTPVerification
                    type="email"
                    identifier={values.email}
                    onVerify={(success) => {
                      if (success) {
                        setIsEmailVerified(true);
                        setSnackbar({
                          open: true,
                          message: 'Email verified successfully',
                          severity: 'success'
                        });
                      }
                    }}
                    CustomButton={<button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-rose-600 text-white py-1 px-2 rounded">Verify</button>}
                  />
                )}
              </div>

              <div className="relative">
                <Field
                  className={`w-full p-2 border placeholder-black rounded-lg ${touched.mobile_number && errors.mobile_number ? 'border-red-500' : 'border-gray-300'}`}
                  name="mobile_number"
                  placeholder="Phone Number"
                  disabled={isMobileVerified}
                />
                {!isMobileVerified && values.mobile_number && !errors.mobile_number && (
                  <OTPVerification
                    type="mobile"
                    identifier={values.mobile_number}
                    onVerify={(success) => {
                      if (success) {
                        setIsMobileVerified(true);
                        setSnackbar({
                          open: true,
                          message: 'Mobile number verified successfully',
                          severity: 'success'
                        });
                      }
                    }}
                    CustomButton={<button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-rose-600 text-white py-1 px-2 rounded">Verify</button>}
                  />
                )}
              </div>
              
              <Field
                className={`w-full p-2 border placeholder-black rounded-lg ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'}`}
                name="password"
                placeholder="Password"
                type="password"
              />
              
              <Field
                className={`w-full p-2 border placeholder-black rounded-lg ${touched.confirm_password && errors.confirm_password ? 'border-red-500' : 'border-gray-300'}`}
                name="confirm_password"
                placeholder="Confirm Password"
                type="password"
              />

              <div className="text-center">
                <p>
                  I agree with the{' '}
                  <RouterLink to="/terms" className="text-amber-400">Terms & Conditions</RouterLink>
                </p>
              </div>
              
              <button
                type="submit"
                className={`w-full bg-pink-900 text-white py-2 rounded-lg font-semibold ${isSubmitting || !isEmailVerified || !isMobileVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting || !isEmailVerified || !isMobileVerified}
              >
                Sign Up
              </button>

              <div className="text-center">
                <p>
                  Already have an account?{' '}
                  <RouterLink to="/login" className="text-amber-400">Sign In</RouterLink>
                </p>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </AuthBackground>
  );
};

export default Signup;