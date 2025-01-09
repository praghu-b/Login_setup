import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import OTPVerification from './OTPVerification';

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

const OTPContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '1rem',
});

const TimerText = styled(Typography)({
  color: '#666',
  fontSize: '0.9rem',
});

const ResendButton = styled(Button)({
  minWidth: 'auto',
});

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('user');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [mobileVerificationError, setMobileVerificationError] = useState('');
  
  // Add snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleTabChange = (event, newValue) => {
    setUserType(newValue);
    setError('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="sm">
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>

        <Tabs value={userType} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="User Signup" value="user" />
          <Tab label="Admin Signup" value="admin" />
        </Tabs>

        {error && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

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
          {({ errors, touched, isSubmitting, values, handleChange }) => (
            <Form>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="first_name"
                  label="First Name"
                  error={touched.first_name && errors.first_name}
                  helperText={touched.first_name && errors.first_name}
                />
                
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="last_name"
                  label="Last Name"
                  error={touched.last_name && errors.last_name}
                  helperText={touched.last_name && errors.last_name}
                />
              </Box>
              
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                error={touched.email && errors.email}
                helperText={touched.email && errors.email}
                disabled={isEmailVerified}
                onChange={(e) => {
                  handleChange(e);
                  localStorage.setItem('tempEmail', e.target.value);
                }}
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
                />
              )}

              <Box sx={{ mb: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="mobile_number"
                  label="Mobile Number"
                  error={touched.mobile_number && errors.mobile_number}
                  helperText={touched.mobile_number && errors.mobile_number}
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
                  />
                )}
              </Box>

              {verificationError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {verificationError}
                </Typography>
              )}
              {mobileVerificationError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {mobileVerificationError}
                </Typography>
              )}
              
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
                disabled={isSubmitting || !isEmailVerified || !isMobileVerified}
              >
                {`Sign Up as ${userType === 'admin' ? 'Admin' : 'User'}`}
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

export default Signup;