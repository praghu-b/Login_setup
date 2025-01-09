import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
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

const AdminSignup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (email) => {
    try {
      setVerificationError('');
      setShowResendButton(false);
      await axios.post('/api/send-signup-otp/', { email });
      setShowOtpField(true);
      setResendTimer(30);
      alert('OTP sent to your email!');
    } catch (error) {
      setVerificationError(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (email) => {
    try {
      setVerificationError('');
      await axios.post('/api/verify-signup-otp/', { 
        email, 
        otp 
      });
      setIsEmailVerified(true);
      setShowOtpField(false);
      setShowResendButton(false);
      alert('Email verified successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to verify OTP';
      setVerificationError(errorMessage);
      if (errorMessage.includes('expired')) {
        setShowResendButton(true);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Admin Sign Up
        </Typography>

        {error && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        <Formik
          initialValues={{
            name: '',
            email: '',
            mobile_number: '',
            password: '',
            confirm_password: '',
          }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (!isEmailVerified) {
                alert('Please verify your email first');
                return;
              }
              setError('');
              await axios.post('/api/register/', {
                ...values,
                user_type: 'admin'
              });
              alert('Registration successful!');
              navigate('/login');
            } catch (error) {
              setError(error.response?.data?.error || 'Registration failed');
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form>
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="name"
                label="Name"
                error={touched.name && errors.name}
                helperText={touched.name && errors.name}
              />

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="email"
                  label="Email"
                  error={touched.email && errors.email}
                  helperText={touched.email && errors.email}
                  disabled={isEmailVerified}
                />
                {!isEmailVerified && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => handleSendOtp(values.email)}
                    disabled={!values.email || errors.email}
                  >
                    Verify Email
                  </Button>
                )}
              </Box>

              {showOtpField && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => handleVerifyOtp(values.email)}
                  >
                    Submit OTP
                  </Button>
                </Box>
              )}

              {showResendButton && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleSendOtp(values.email)}
                  disabled={resendTimer > 0}
                  sx={{ mt: 1 }}
                >
                  {resendTimer > 0 
                    ? `Resend OTP in ${resendTimer}s` 
                    : 'Resend OTP'}
                </Button>
              )}

              {verificationError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {verificationError}
                </Typography>
              )}

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="mobile_number"
                label="Mobile Number"
                error={touched.mobile_number && errors.mobile_number}
                helperText={touched.mobile_number && errors.mobile_number}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type="password"
                error={touched.password && errors.password}
                helperText={touched.password && errors.password}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="confirm_password"
                label="Confirm Password"
                type="password"
                error={touched.confirm_password && errors.confirm_password}
                helperText={touched.confirm_password && errors.confirm_password}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting || !isEmailVerified}
              >
                Sign Up
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <MuiLink component={RouterLink} to="/login" variant="body2">
                  Already have an account? Login
                </MuiLink>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default AdminSignup; 